import {
  CanActivate,
  ContextType,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { InjectLogger, LoggerService } from "@flowcore/microservice";
import { OidcProtectService } from "../oidc-protect/oidc-protect.service";
import { Reflector } from "@nestjs/core";
import {
  OPERATION_ROLES_REQUIRED,
  RolesDefinition,
} from "../decorator/roles.decorator";
import { PUBLIC_OPERATION_KEY } from "../decorator/public.decorator";

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

    const requiredRoles = this.reflector.getAllAndOverride<RolesDefinition>(
      OPERATION_ROLES_REQUIRED,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { headers } = await this.oidcProtect.extractRequest(context);

    const { decodedToken } = this.oidcProtect.extractTokens(headers);

    const realmRoles = this.oidcProtect.extractRealmRoles(decodedToken);

    const resourceRoles = this.oidcProtect.extractResourceRoles(decodedToken);

    const { roles } = requiredRoles;

    for (const role of roles) {
      const [roleType] = role.split(":");

      switch (roleType) {
        default:
          this.logger.error(`Role type ${roleType} not currently supported`);
          return false;
        case "realm":
          return this.oidcProtect.validateRealmRole(realmRoles, role);
        case "resource":
          return this.oidcProtect.validateResourceRole(resourceRoles, role);
      }
    }

    return false;
  }

  private async getRequest(context: ExecutionContext) {
    if (context.getType<ContextType | "graphql">() === "graphql") {
      try {
        const GqlExecutionContext = (await import("@nestjs/graphql"))
          .GqlExecutionContext;
        return GqlExecutionContext.create(context).getContext().req;
      } catch (err) {
        throw new Error(
          "context is GraphQL but @nestjs/graphql package is installed",
        );
      }
    }
    return context.switchToHttp().getRequest();
  }
}
