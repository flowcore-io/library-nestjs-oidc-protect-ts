import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { OidcProtectService } from "../oidc-protect/oidc-protect.service";

export interface TokenOptions {
	required?: boolean;
	storedIn?: string;
}

export const Token = createParamDecorator<TokenOptions>(
	async (data, ctx: ExecutionContext) => {
		const request = await OidcProtectService.getRequest(ctx);

		const { required = true, storedIn = "token" } = data || {};

		if (!request[storedIn] && required) {
			throw new Error("Token not found");
		}

		return request[storedIn];
	},
);
