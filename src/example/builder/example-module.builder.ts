import { BaseBuilder, ConfigService } from "@flowcore/microservice";
import { ExampleModule } from "../example.module";
import { ExampleConfiguration } from "../config/example.configuration";

export class ExampleModuleBuilder extends BaseBuilder {
  requiredContext = ["example"];

  override build() {
    super.build();

    if (!this.config) {
      throw new Error(`Missing config for ${this.constructor.name}`);
    }

    return ExampleModule.registerAsync({
      imports: [this.config],
      inject: [ConfigService],
      useFactory: (config: ConfigService<ExampleConfiguration>) => ({
        level: config.schema.logger.level,
        pretty: config.schema.logger.pretty,
        useLevelLabels: config.schema.logger.useLabels,
      }),
    });
  }
}
