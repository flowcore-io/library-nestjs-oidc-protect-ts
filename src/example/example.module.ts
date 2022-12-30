import { AsyncOptions, createAsyncModule } from "@jbiskur/nestjs-async-module";
import { DynamicModule, Module } from "@nestjs/common";
import { ExampleModuleOptions } from "./interface/example-module-options.interface";

@Module({
  providers: [],
})
export class ExampleModule extends createAsyncModule<ExampleModuleOptions>() {
  public static registerAsync(
    options: AsyncOptions<ExampleModuleOptions>,
  ): DynamicModule {
    return super.registerAsync(options, ExampleModule);
  }
}
