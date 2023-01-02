import { BaseBuilder, ConfigService } from "@flowcore/microservice";
import { OidcProtectModule } from "../oidc-protect.module";
import { OidcProtectConfiguration } from "../config/oidc-protect.configuration";

export class OidcProtectModuleBuilder extends BaseBuilder {
  requiredContext = ["library"];

  override build() {
    super.build();

    if (!this.config) {
      throw new Error(`Missing config for ${this.constructor.name}`);
    }

    return OidcProtectModule.registerAsync({
      imports: [this.config],
      inject: [ConfigService],
      useFactory: (config: ConfigService<OidcProtectConfiguration>) => ({
        wellKnownUrl: config.schema.wellKnownUrl,
        resourceId: config.schema.resourceId,
      }),
    });
  }
}
