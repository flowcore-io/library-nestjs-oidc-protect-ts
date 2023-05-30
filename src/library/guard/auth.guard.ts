import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectLogger, LoggerService } from "@flowcore/microservice";
import dayjs from "dayjs";
import { OidcProtectService } from "../oidc-protect/oidc-protect.service";
import { Reflector } from "@nestjs/core";
import { PUBLIC_OPERATION_KEY } from "../decorator/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectLogger() private readonly logger: LoggerService,
    private readonly oidcProtect: OidcProtectService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { request, headers } = await this.oidcProtect.extractRequest(context);

    if (this.oidcProtect.isPublicEndpoint(request?.path)) {
      return await this.extractOptionalToken(request, headers);
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_OPERATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return await this.extractOptionalToken(request, headers);
    }

    if (!headers.authorization) {
      throw new UnauthorizedException("No authorization header found");
    }

    const { token, decodedToken } = this.oidcProtect.extractTokens(headers);

    const isExpired = dayjs().isAfter(dayjs.unix(decodedToken.exp));

    if (isExpired) {
      throw new UnauthorizedException("Token is expired");
    }

    if (
      !(await this.oidcProtect.validateToken(
        token,
        dayjs.unix(decodedToken.exp),
      ))
    ) {
      throw new UnauthorizedException("Invalid authorization token");
    }

    console.log("TOKEN:", decodedToken);

    request.authenticatedUser = decodedToken;

    return true;
  }

  private async extractOptionalToken(request: any, headers: any) {
    if (!headers.authorization) {
      return true;
    }

    try {
      const { token, decodedToken } = this.oidcProtect.extractTokens(headers);

      if (
        !(await this.oidcProtect.validateToken(
          token,
          dayjs.unix(decodedToken.exp),
        ))
      ) {
        return true;
      }

      request.authenticatedUser = decodedToken;
      return true;
    } catch (e) {
      return true;
    }
  }
}
