import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { OidcProtectService } from "../oidc-protect/oidc-protect.service";

export interface AuthenticatedUserOptions {
  required?: boolean;
  storedIn?: string;
}

export const AuthenticatedUser = createParamDecorator<AuthenticatedUserOptions>(
  async (
    { required = true, storedIn = "authenticatedUser" },
    ctx: ExecutionContext,
  ) => {
    const request = await OidcProtectService.getRequest(ctx);

    if (!request[storedIn] && required) {
      throw new Error("AuthenticatedUser not found");
    }

    return request[storedIn];
  },
);
