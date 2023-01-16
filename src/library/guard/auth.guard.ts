import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
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
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_OPERATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    if (!headers.authorization) {
      throw new HttpException("No authorization header found", 401);
    }

    const { token, decodedToken } = this.oidcProtect.extractTokens(headers);

    const isExpired = dayjs().isAfter(dayjs.unix(decodedToken.exp));

    if (isExpired) {
      throw new HttpException("Token is expired", 401);
    }

    if (!(await this.oidcProtect.validateToken(token))) {
      throw new HttpException("Invalid authorization token", 401);
    }

    request.authenticatedUser = decodedToken;

    return true;
  }
}
