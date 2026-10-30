import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException({
        errorCode: 'ERR_INSUFFICIENT_PERMISSIONS',
        detail: 'No posee un rol asignado para ejecutar esta acción.',
      });
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException({
        errorCode: 'ERR_INSUFFICIENT_PERMISSIONS',
        detail: `Su rol [${user.role}] no tiene permisos para acceder a este recurso.`,
      });
    }

    return true;
  }
}

