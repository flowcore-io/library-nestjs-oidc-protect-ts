import {
  ContextType,
  ExecutionContext,
  Injectable,
  OnApplicationBootstrap,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectLogger, LoggerService } from "@flowcore/microservice";
import { ModuleOptions } from "@jbiskur/nestjs-async-module";
import { OidcProtectModuleOptions } from "../interface/oidc-protect-module-options.interface";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { ICache } from "../interface/cache.interface";
import md5 from "md5";
import dayjs from "dayjs";

let gqlExecutionContext: any = null;

@Injectable()
export class OidcProtectService implements OnApplicationBootstrap {
  private userInfoEndpoint: string = null;
  private roleAvailable = true;
  private resourceId: string = null;
  private cacheManager: ICache = null;

  constructor(
    @InjectLogger() private readonly logger: LoggerService,
    private readonly options: ModuleOptions<OidcProtectModuleOptions>,
  ) {}

  public static async getRequest(context: ExecutionContext) {
    if (context.getType<ContextType | "graphql">() === "graphql") {
      try {
        if (!gqlExecutionContext) {
          gqlExecutionContext = (await import("@nestjs/graphql"))
            .GqlExecutionContext;
        }
        return gqlExecutionContext.create(context).getContext().req;
      } catch (err) {
        throw new Error(
          "context is GraphQL but @nestjs/graphql package is installed",
        );
      }
    }
    return context.switchToHttp().getRequest();
  }

  async validateToken(token: string, expirationDate: dayjs.Dayjs) {
    try {
      if (this.cacheManager) {
        const cached = await this.cacheManager.get(md5(token));
        if (cached) {
          return true;
        }
      }

      const { status } = await axios.get(this.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (status === 200 && this.cacheManager) {
        await this.cacheManager.set(
          md5(token),
          "true",
          dayjs().diff(expirationDate.subtract(1, "minute"), "millisecond"),
        );
      }

      return status === 200;
    } catch (error) {
      this.logger.error(error as string, {
        error,
      });
    }
  }

  public isPublicEndpoint(endpoint: string) {
    const { wellKnownPublicEndpoints } = this.options.get();

    return wellKnownPublicEndpoints?.includes(endpoint);
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

    if (this.options.get().cache) {
      this.cacheManager = this.options.get().cache;
    }
  }

  extractTokens(headers: any) {
    const [bearer, token] = headers.authorization.split(" ");

    if (bearer !== "Bearer") {
      throw new UnauthorizedException(
        "Invalid authorization header",
        "Bearer token expected",
      );
    }

    let decodedToken: any;

    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      this.logger.error(`Failed to decode token: ${token}`, {
        error,
      });

      throw new UnauthorizedException(
        "Invalid authorization token",
        "Failed to decode token",
      );
    }
    return { token, decodedToken };
  }

  async extractRequest(context: ExecutionContext) {
    const request = await OidcProtectService.getRequest(context);

    const { headers } = request;

    return { request, headers };
  }

  validateResourceRole(realmRoles: string[], requiredRole: string) {
    if (!this.roleAvailable) {
      this.logger.error(`No ResourceId specified, so role check is disabled`);
      return false;
    }
    return this.validateRole(realmRoles, `${this.resourceId}:${requiredRole}`);
  }

  validateRealmRole(realmRoles: string[], requiredRole: string) {
    return this.validateRole(realmRoles, requiredRole);
  }

  extractRealmRoles(decodedToken: any) {
    return decodedToken?.realm_access?.roles || [];
  }

  extractResourceRoles(decodedToken: any) {
    return (
      decodedToken?.resource_access?.[this.options.get().resourceId]?.roles.map(
        (role) => `${this.resourceId}:${role}`,
      ) || []
    );
  }

  private validateRole(roles: string[], requiredRole: string) {
    return roles.includes(requiredRole);
  }
}
