import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { OidcProtectService } from "../oidc-protect/oidc-protect.service";

export const AuthenticatedUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = await OidcProtectService.getRequest(ctx);

    if (!request.authenticatedUser) {
      throw new Error("AuthenticatedUser not found");
    }

    return request.authenticatedUser;
  },
);
