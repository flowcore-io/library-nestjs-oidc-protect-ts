import { AsyncOptions, createAsyncModule } from "@jbiskur/nestjs-async-module";
import { DynamicModule, Module } from "@nestjs/common";
import { OidcProtectModuleOptions } from "./interface/oidc-protect-module-options.interface";
import { OidcProtectService } from "./oidc-protect/oidc-protect.service";

@Module({
  providers: [OidcProtectService],
  exports: [OidcProtectService],
})
export class OidcProtectModule extends createAsyncModule<OidcProtectModuleOptions>() {
  public static registerAsync(
    options: AsyncOptions<OidcProtectModuleOptions>,
  ): DynamicModule {
    return super.registerAsync(options, OidcProtectModule);
  }
}
