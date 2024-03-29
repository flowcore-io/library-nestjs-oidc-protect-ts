import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectLogger, LoggerService } from "@flowcore/microservice";
import { OidcProtectService } from "../oidc-protect/oidc-protect.service";
import { Reflector } from "@nestjs/core";
import { PUBLIC_OPERATION_KEY } from "../decorator/public.decorator";
import { OPERATION_REALM_ROLES_REQUIRED } from "../decorator/realm-roles.decorator";
import * as _ from "lodash";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    @InjectLogger() private readonly logger: LoggerService,
    private readonly oidcProtect: OidcProtectService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_OPERATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const requiredRealmRoles = this.getRoles(
      context,
      OPERATION_REALM_ROLES_REQUIRED,
    );

    if (!requiredRealmRoles) {
      return true;
    }

    const { headers } = await this.oidcProtect.extractRequest(context);

    if (!headers.authorization) {
      throw new UnauthorizedException("No authorization header found");
    }

    const { decodedToken } = this.oidcProtect.extractTokens(headers);

    const realmRoles = this.oidcProtect.extractRealmRoles(decodedToken);

    const hasAccess = _.some(requiredRealmRoles, (role) =>
      this.oidcProtect.validateRealmRole(realmRoles, role),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        "Invalid authorization token",
        "User does not have roles required to access this resource",
      );
    }

    return true;
  }

  private getRoles(context: ExecutionContext, metadataKey: string) {
    return this.reflector.getAllAndOverride<string[]>(metadataKey, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
