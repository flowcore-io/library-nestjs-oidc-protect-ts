import { BaseBuilder, ConfigService } from "@flowcore/microservice";
import { OidcProtectModule } from "../oidc-protect.module";
import { OidcProtectConfiguration } from "../config/oidc-protect.configuration";

export class OidcProtectModuleBuilder extends BaseBuilder {
  requiredContext = ["library"];

  private usePublicEndpoints = true;
  private wellKnownPublicEndpoints = ["/health", "/metrics"];

  public noPublicEndpoints(): this {
    this.usePublicEndpoints = false;
    return this;
  }

  public overridePublicEndpoints(endpoints: string[]): this {
    this.wellKnownPublicEndpoints = endpoints;
    return this;
  }

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
        wellKnownPublicEndpoints: this.usePublicEndpoints
          ? this.wellKnownPublicEndpoints
          : [],
      }),
    });
  }
}
