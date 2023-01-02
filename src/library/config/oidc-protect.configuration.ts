import { z } from "zod";
import { ConfigurationSchema } from "@flowcore/microservice";

export const OidcProtectConfigurationShape = z.object({
  wellKnownUrl: z.string().url(),
  resourceId: z.string().optional(),
});
export type OidcProtectConfiguration = z.infer<
  typeof OidcProtectConfigurationShape
>;

export class OidcProtectConfigurationSchema extends ConfigurationSchema {
  context = "library";
  linking = {
    wellKnownUrl: {
      env: "OIDC_WELLKNOWN_URL",
    },
    resourceId: {
      env: "OIDC_RESOURCE_ID",
    },
  };
  shape = OidcProtectConfigurationShape;
}
