import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  branchId: string;
  sessionId: string;
  jti: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'sigo_jwt_super_secret_key_change_in_prod'),
    });
  }

  async validate(payload: JwtPayload) {
    // 1. Verificar si el token fue revocado en la lista negra
    const isRevoked = await this.redisService.isTokenBlacklisted(payload.jti);
    if (isRevoked) {
      throw new UnauthorizedException({
        errorCode: 'ERR_TOKEN_REVOKED',
        detail: 'Este token ha sido revocado. Inicie sesión nuevamente.',
      });
    }

    // 2. Verificar actividad de la sesión (Sliding expiration 15 min)
    const isSessionActive = await this.redisService.refreshSessionActivity(payload.sub, payload.sessionId, 900);
    if (!isSessionActive) {
      throw new UnauthorizedException({
        errorCode: 'ERR_SESSION_TIMEOUT_INACTIVITY',
        detail: 'Su sesión ha caducado por 15 minutos de inactividad.',
      });
    }

    // 3. Verificar que el usuario exista y siga activo
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true, branch: true },
    });

    if (!user || !user.isActive || user.isDeleted) {
      throw new UnauthorizedException({
        errorCode: 'ERR_USER_INACTIVE_OR_DELETED',
        detail: 'El usuario se encuentra inactivo o ha sido eliminado.',
      });
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      roleId: user.roleId,
      branchId: user.branchId,
      branchName: user.branch.name,
      firstName: user.firstName,
      lastName: user.lastName,
      sessionId: payload.sessionId,
      jti: payload.jti,
    };
  }
}

