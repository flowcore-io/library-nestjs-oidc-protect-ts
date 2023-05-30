import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { OidcProtectService } from "../oidc-protect/oidc-protect.service";

export interface AuthenticatedUserOptions {
  required?: boolean;
}

export const AuthenticatedUser = createParamDecorator<AuthenticatedUserOptions>(
  async (data, ctx: ExecutionContext) => {
    const request = await OidcProtectService.getRequest(ctx);

    const { required = true } = data || {};

    if (!request.authenticatedUser && required) {
      throw new Error("AuthenticatedUser not found");
    }

    return request.authenticatedUser;
  },
);
