import { BaseBuilder, ConfigService } from "@flowcore/microservice";
import { OidcProtectModule } from "../oidc-protect.module";
import { OidcProtectConfiguration } from "../config/oidc-protect.configuration";
import { ICache } from "../interface/cache.interface";
import { DynamicModule, Type } from "@nestjs/common";

export class OidcProtectModuleBuilder extends BaseBuilder {
  requiredContext = ["library"];

  private usePublicEndpoints = true;
  private wellKnownPublicEndpoints = ["/health", "/metrics"];
  private cacheModule: DynamicModule;
  private cache: Type | string;

  public noPublicEndpoints(): this {
    this.usePublicEndpoints = false;
    return this;
  }

  public overridePublicEndpoints(endpoints: string[]): this {
    this.wellKnownPublicEndpoints = endpoints;
    return this;
  }

  public withCache(module: DynamicModule, cache: Type | string): this {
    this.cacheModule = module;
    this.cache = cache;
    return this;
  }

  override build() {
    super.build();

    if (!this.config) {
      throw new Error(`Missing config for ${this.constructor.name}`);
    }

    if (!this.cacheModule || !this.cache) {
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

    return OidcProtectModule.registerAsync({
      imports: [this.config, ...(this.cacheModule ? [this.cacheModule] : [])],
      inject: [ConfigService, ...(this.cache ? [this.cache] : [])],
      useFactory: (
        config: ConfigService<OidcProtectConfiguration>,
        cacheFunction: ICache,
      ) => ({
        wellKnownUrl: config.schema.wellKnownUrl,
        resourceId: config.schema.resourceId,
        wellKnownPublicEndpoints: this.usePublicEndpoints
          ? this.wellKnownPublicEndpoints
          : [],
        cache: cacheFunction,
      }),
    });
  }
}
