import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
} from "@nestjs/common";
import { InjectLogger, LoggerService } from "@flowcore/microservice";
import { OidcProtectService } from "../oidc-protect/oidc-protect.service";
import { Reflector } from "@nestjs/core";
import { PUBLIC_OPERATION_KEY } from "../decorator/public.decorator";
import * as _ from "lodash";
import { OPERATION_RESOURCE_ROLES_REQUIRED } from "../decorator/resource-roles.decorator";

@Injectable()
export class ResourceGuard implements CanActivate {
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

    const requiredResourceRoles = this.getRoles(
      context,
      OPERATION_RESOURCE_ROLES_REQUIRED,
    );

    if (!requiredResourceRoles) {
      return true;
    }

    const { headers } = await this.oidcProtect.extractRequest(context);

    if (!headers.authorization) {
      throw new HttpException("No authorization header found", 401);
    }

    const { decodedToken } = this.oidcProtect.extractTokens(headers);

    const resourceRoles = this.oidcProtect.extractResourceRoles(decodedToken);

    const hasAccess = _.some(requiredResourceRoles, (role) =>
      this.oidcProtect.validateResourceRole(resourceRoles, role),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        "Invalid authorization token",
        "User does not have access to this resource",
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
