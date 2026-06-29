import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard de rôles — s'applique après JwtAuthGuard.
 * Lit les rôles autorisés via le décorateur @Roles() et les compare
 * au rôle de l'utilisateur déjà attaché à la requête par JwtAuthGuard.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    // Si @Roles() n'est pas présent sur la route, elle est accessible à tous les rôles
    if (!roles) return true;

    const user = context.switchToHttp().getRequest()['user'];

    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException('Accès réservé aux administrateurs');
    }

    return true;
  }
}
