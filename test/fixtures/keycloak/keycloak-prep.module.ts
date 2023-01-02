//global helper method :
import { Module } from "@nestjs/common";
import { AsyncOptions, createAsyncModule } from "@jbiskur/nestjs-async-module";
import { KeycloakPrepModuleOptions } from "./keycloak-prep-module-options.interface";
import { KeycloakPrepService } from "./keycloak-prep.service";

@Module({
  providers: [KeycloakPrepService],
})
export class KeycloakPrepModule extends createAsyncModule<KeycloakPrepModuleOptions>() {
  public static registerAsync(
    options: AsyncOptions<KeycloakPrepModuleOptions>,
  ): any {
    return super.registerAsync(options, KeycloakPrepModule);
  }
}
