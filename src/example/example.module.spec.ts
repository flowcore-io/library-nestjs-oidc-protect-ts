import { NestApplicationBuilder } from "@jbiskur/nestjs-test-utilities";
import { INestApplication, Module } from "@nestjs/common";
import { ConfigFactory, ConfigModule } from "@flowcore/microservice";
import { ExampleConfigurationSchema } from "./config/example.configuration";
import { ExampleModuleBuilder } from "./builder/example-module.builder";
import { ExampleService } from "./example/example.service";

const config = ConfigModule.forRoot(
  new ConfigFactory().withSchema(ExampleConfigurationSchema),
);

@Module({
  imports: [config, new ExampleModuleBuilder().withConfig(config).build()],
  providers: [],
})
class TestModule {}

describe("Example Module", () => {
  const app: INestApplication;

  beforeEach(async () => {
    const app = await new NestApplicationBuilder()
      .withTestModule((testModule) => testModule.withModule(TestModule))
      .build();
  });

  it("should say hello", async () => {
    const test = await app.resolve(ExampleService);

    expect(test.sayHello()).toEqual("Hello Peter");
  });

  afterEach(async () => {
    await app.close();
  });
});
