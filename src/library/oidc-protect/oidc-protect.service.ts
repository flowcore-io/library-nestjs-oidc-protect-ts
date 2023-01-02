import {
  ContextType,
  ExecutionContext,
  HttpException,
  Injectable,
  OnApplicationBootstrap,
} from "@nestjs/common";
import { InjectLogger, LoggerService } from "@flowcore/microservice";
import { ModuleOptions } from "@jbiskur/nestjs-async-module";
import { OidcProtectModuleOptions } from "../interface/oidc-protect-module-options.interface";
import axios from "axios";
import jwtDecode from "jwt-decode";

@Injectable()
export class OidcProtectService implements OnApplicationBootstrap {
  private userInfoEndpoint: string = null;
  private roleAvailable = true;
  private resourceId: string = null;

  constructor(
    @InjectLogger() private readonly logger: LoggerService,
    private readonly options: ModuleOptions<OidcProtectModuleOptions>,
  ) {}

  async validateToken(token: string) {
    try {
      const { status } = await axios.get(this.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return status === 200;
    } catch (error) {
      this.logger.error(error as string, {
        error,
      });
    }
  }

  async onApplicationBootstrap() {
    const { wellKnownUrl, resourceId } = this.options.get();

    const { data } = await axios.get(wellKnownUrl);

    this.userInfoEndpoint = data.userinfo_endpoint;

    if (!this.userInfoEndpoint) {
      throw new Error(`No userInfoEndpoint found at ${wellKnownUrl}`);
    }

    if (!resourceId) {
      this.roleAvailable = false;
      this.logger.warn(`No ResourceId specified, so role check is disabled`);
      return;
    }

    this.resourceId = resourceId;
  }

  extractTokens(headers: any) {
    const [bearer, token] = headers.authorization.split(" ");

    if (bearer !== "Bearer") {
      throw new HttpException("Invalid authorization header", 401);
    }

    let decodedToken: any;

    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      this.logger.error(error as string, {
        error,
      });

      throw new HttpException("Invalid authorization token", 401);
    }
    return { token, decodedToken };
  }

  async extractRequest(context: ExecutionContext) {
    const request = await this.getRequest(context);

    const { headers } = request;

    if (!headers.authorization) {
      throw new HttpException("No authorization header found", 401);
    }
    return { request, headers };
  }

  validateResourceRole(realmRoles: string[], requiredRole: string) {
    if (!this.roleAvailable) {
      this.logger.error(`No ResourceId specified, so role check is disabled`);
      return false;
    }
    return this.validateRole(
      realmRoles,
      requiredRole.replace("resource:", `${this.resourceId}:`),
    );
  }

  validateRealmRole(realmRoles: string[], requiredRole: string) {
    return this.validateRole(realmRoles, requiredRole);
  }

  extractRealmRoles(decodedToken: any) {
    return (
      decodedToken?.realm_access?.roles?.map((role) => `realm:${role}`) || []
    );
  }

  extractResourceRoles(decodedToken: any) {
    return (
      decodedToken?.resource_access?.[this.options.get().resourceId]?.roles.map(
        (role) => `${this.resourceId}:${role}`,
      ) || []
    );
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

  private validateRole(roles: string[], requiredRole: string) {
    return roles.includes(requiredRole);
  }
}
