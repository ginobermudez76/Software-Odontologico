import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  /**
   * Inicio de sesión seguro con control de fuerza bruta y emisión de tokens
   */
  async login(loginDto: LoginDto, ipAddress: string = '127.0.0.1', userAgent: string = 'Unknown') {
    const { email, password } = loginDto;

    // 1. Control de Fuerza Bruta en Redis (máximo 5 intentos fallidos en 15 min)
    const bruteForceKey = `login:attempts:${email}`;
    const redisClient = this.redisService.getClient();
    const attempts = await redisClient.get(bruteForceKey);

    if (attempts && parseInt(attempts, 10) >= 5) {
      throw new UnauthorizedException({
        errorCode: 'ERR_ACCOUNT_TEMPORARILY_LOCKED',
        detail: 'Demasiados intentos fallidos. Su cuenta ha sido bloqueada temporalmente por 15 minutos.',
      });
    }

    // 2. Búsqueda del usuario activo
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        isDeleted: false,
      },
      include: {
        role: true,
        branch: true,
      },
    });

    if (!user) {
      await this.incrementFailedAttempts(bruteForceKey);
      throw new UnauthorizedException({
        errorCode: 'ERR_INVALID_CREDENTIALS',
        detail: 'Correo electrónico o contraseña incorrectos.',
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        errorCode: 'ERR_USER_DEACTIVATED',
        detail: 'Su usuario se encuentra deshabilitado. Contacte a la administración.',
      });
    }

    // 3. Verificación de contraseña criptográfica
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.incrementFailedAttempts(bruteForceKey);
      throw new UnauthorizedException({
        errorCode: 'ERR_INVALID_CREDENTIALS',
        detail: 'Correo electrónico o contraseña incorrectos.',
      });
    }

    // Reiniciar contador de intentos fallidos tras login exitoso
    await redisClient.del(bruteForceKey);

    // 4. Generación de Sesión y Tokens
    const sessionId = uuidv4();
    const jti = uuidv4();

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      branchId: user.branchId,
      sessionId,
      jti,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = uuidv4();

    // 5. Persistencia de Sesión Activa en Redis (Sliding 15 min de inactividad, 8h max)
    await this.redisService.setSession(
      user.id,
      sessionId,
      {
        userId: user.id,
        role: user.role.name,
        branchId: user.branchId,
        refreshToken,
        ipAddress,
        userAgent,
        createdAt: new Date().toISOString(),
      },
      900, // 15 minutos de inactividad inicial
    );

    // Guardar Refresh Token en Redis con 8 horas de duración
    const refreshKey = `session:refresh:${refreshToken}`;
    await redisClient.setex(refreshKey, 28800, JSON.stringify({ userId: user.id, sessionId }));

    // 6. Registro de Auditoría Forense
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role.name,
        action: 'LOGIN',
        resource: 'AUTH',
        resourceId: user.id,
        ipAddress,
        userAgent,
        metadata: { status: 'SUCCESS' },
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        branchId: user.branchId,
        branchName: user.branch.name,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900, // segundos (15m)
      },
    };
  }

  /**
   * Refresco de token de acceso sin solicitar credenciales nuevamente
   */
  async refresh(refreshToken: string) {
    const redisClient = this.redisService.getClient();
    const refreshKey = `session:refresh:${refreshToken}`;
    const sessionDataStr = await redisClient.get(refreshKey);

    if (!sessionDataStr) {
      throw new UnauthorizedException({
        errorCode: 'ERR_REFRESH_TOKEN_EXPIRED',
        detail: 'Su sesión ha caducado por completo. Por favor inicie sesión nuevamente.',
      });
    }

    const sessionData = JSON.parse(sessionDataStr);
    const user = await this.prisma.user.findUnique({
      where: { id: sessionData.userId },
      include: { role: true, branch: true },
    });

    if (!user || !user.isActive || user.isDeleted) {
      throw new UnauthorizedException({
        errorCode: 'ERR_USER_INVALID',
        detail: 'El usuario ya no se encuentra disponible.',
      });
    }

    const jti = uuidv4();
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      branchId: user.branchId,
      sessionId: sessionData.sessionId,
      jti,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
    });

    // Refrescar el TTL de la sesión en Redis
    await this.redisService.refreshSessionActivity(user.id, sessionData.sessionId, 900);

    return {
      accessToken: newAccessToken,
      expiresIn: 900,
    };
  }

  /**
   * Cierre forzado o voluntario de sesión y revocación inmediata de token
   */
  async logout(userId: string, sessionId: string, jti: string) {
    // 1. Eliminar la sesión activa en Redis
    await this.redisService.revokeSession(userId, sessionId);

    // 2. Colocar el JWT en Lista Negra para invalidación instantánea (15 min TTL)
    await this.redisService.blacklistToken(jti, 900);

    return { message: 'Sesión cerrada exitosamente.' };
  }

  /**
   * Retorna el árbol dinámico de navegación para el Sidebar según los roles y permisos del usuario
   * Contiene los booleanos lectura, escritura, borrado para control de UI
   */
  async getMyNavigation(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Consulta de opciones asignadas al rol del usuario en la tabla puente rol_opcion
    const roleOptions = await this.prisma.roleMenuOption.findMany({
      where: {
        roleId: user.roleId,
        isDeleted: false,
        lectura: true, // Solo mostrar opciones donde lectura sea verdadera
        menuOption: {
          isDeleted: false,
          isActive: true,
        },
      },
      include: {
        menuOption: true,
      },
      orderBy: {
        menuOption: {
          orderIndex: 'asc',
        },
      },
    });

    return roleOptions.map((ro) => ({
      id: ro.menuOption.id,
      parentId: ro.menuOption.parentId,
      optionCode: ro.menuOption.optionCode,
      title: ro.menuOption.title,
      frontendRoute: ro.menuOption.frontendRoute,
      materialIcon: ro.menuOption.materialIcon,
      orderIndex: ro.menuOption.orderIndex,
      // Booleanos granulares que controlan botones en el Frontend:
      lectura: ro.lectura,
      escritura: ro.escritura,
      borrado: ro.borrado,
    }));
  }

  private async incrementFailedAttempts(key: string) {
    const redis = this.redisService.getClient();
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 900); // 15 minutos
    }
  }
}

