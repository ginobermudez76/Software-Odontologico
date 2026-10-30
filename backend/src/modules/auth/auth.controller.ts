import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Ip,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Autenticación y Sesiones')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con credenciales de usuario' })
  @ApiResponse({ status: 200, description: 'Sesión iniciada exitosamente' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o cuenta bloqueada' })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso JWT' })
  @ApiResponse({ status: 200, description: 'Nuevo Access Token emitido' })
  @ApiResponse({ status: 401, description: 'Refresh token expirado o inválido' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión y revocar tokens activos' })
  @ApiResponse({ status: 200, description: 'Sesión revocada' })
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.userId, user.sessionId, user.jti);
  }

  @Get('my-navigation')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener árbol dinámico de navegación Sidebar con permisos de lectura/escritura/borrado',
  })
  @ApiResponse({ status: 200, description: 'Lista de opciones dinámicas autorizadas' })
  async getMyNavigation(@CurrentUser('userId') userId: string) {
    return this.authService.getMyNavigation(userId);
  }
}

