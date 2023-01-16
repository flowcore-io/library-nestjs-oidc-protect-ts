import { NestApplicationBuilder } from "@jbiskur/nestjs-test-utilities";
import { INestApplication, Module } from "@nestjs/common";
import {
  ConfigFactory,
  ConfigModule,
  ConfigService,
} from "@flowcore/microservice";
import {
  AuthGuardBuilder,
  OidcProtectConfigurationSchema,
  OidcProtectModuleBuilder,
} from "../src";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { TestResolver } from "./fixtures/test.resolver";
import supertest from "supertest";
import { KeycloakPrepModule } from "./fixtures/keycloak/keycloak-prep.module";
import { LoggerModulePlugin } from "@flowcore/testing-microservice";
import {
  KeycloakPrepService,
  UserType,
} from "./fixtures/keycloak/keycloak-prep.service";
import { DocumentNode, print } from "graphql/language";
import gql from "graphql-tag";
import * as path from "path";

const config = ConfigModule.forRoot(
  new ConfigFactory().withSchema(OidcProtectConfigurationSchema),
);

@Module({
  imports: [
    config,
    new OidcProtectModuleBuilder().withConfig(config).build(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.join(__dirname, "test.schema.gql"),
    }),
    KeycloakPrepModule.registerAsync({
      imports: [config],
      inject: [ConfigService],
      useFactory: (config) => ({
        wellKnownUrl: config.schema.wellKnownUrl,
        baseUrl: "http://localhost:8080",
      }),
    }),
  ],
  providers: [
    TestResolver,
    ...new AuthGuardBuilder().usingRoleGuard().usingResourceGuard().build(),
  ],
})
class AppModule {}

async function queryGraphQLEndpoint(
  app: INestApplication,
  query: DocumentNode,
  token?: string,
) {
  const sut = supertest(app.getHttpServer()).post("/graphql");

  if (token) {
    sut.set("Authorization", `Bearer ${token}`);
  }

  return sut.send({
    query: print(query),
  });
}

describe("OIDC Protect Module", () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await new NestApplicationBuilder()
      .withTestModule((testModule) => testModule.withModule(AppModule))
      .with(LoggerModulePlugin)
      .build();
  });

  it("should fail with no authorization token", async () => {
    const response = await queryGraphQLEndpoint(
      app,
      gql`
        query {
          test
        }
      `,
    );

    expect(
      response.body.errors.find(
        (errorItem) =>
          errorItem.message.match(/No authorization/) &&
          errorItem.extensions.exception.status === 401,
      ),
    ).toBeTruthy();
  });

  it("should fail with invalid authorization token", async () => {
    const response = await queryGraphQLEndpoint(
      app,
      gql`
        query {
          test
        }
      `,
      "invalid",
    );

    expect(
      response.body.errors.find(
        (errorItem) =>
          errorItem.message.match(/Invalid authorization/) &&
          errorItem.extensions.exception.status === 401,
      ),
    ).toBeTruthy();
  });

  it("should pass with valid authorization token", async () => {
    const token = await (
      await app.resolve(KeycloakPrepService)
    ).getUserToken(UserType.TEST_USER);
    const response = await queryGraphQLEndpoint(
      app,
      gql`
        query {
          test
        }
      `,
      token,
    );

    expect(response.body.data.test).toBe("test");
  });

  it("should pass for public operation", async () => {
    const response = await queryGraphQLEndpoint(
      app,
      gql`
        query {
          public
        }
      `,
    );

    expect(response.body.data.public).toBe("public");
  });

  it("should return forbidden with no access to realm role", async () => {
    const token = await (
      await app.resolve(KeycloakPrepService)
    ).getUserToken(UserType.NO_ACCESS_USER);

    const response = await queryGraphQLEndpoint(
      app,
      gql`
        query {
          realmRole
        }
      `,
      token,
    );

    expect(
      response.body.errors.find(
        (errorItem) =>
          errorItem.message.match(/Forbidden/) &&
          errorItem.extensions.response.statusCode === 403,
      ),
    ).toBeTruthy();
  });

  it("should pass with valid access to realm role", async () => {
    const token = await (
      await app.resolve(KeycloakPrepService)
    ).getUserToken(UserType.TEST_USER);

    const response = await queryGraphQLEndpoint(
      app,
      gql`
        query {
          realmRole
        }
      `,
      token,
    );

    expect(response.body.data.realmRole).toBe("realmRole");
  });

  it("should return forbidden with no access to resource role", async () => {
    const token = await (
      await app.resolve(KeycloakPrepService)
    ).getUserToken(UserType.NO_ACCESS_USER);

    const response = await queryGraphQLEndpoint(
      app,
      gql`
        query {
          resourceRole
        }
      `,
      token,
    );

    expect(
      response.body.errors.find(
        (errorItem) =>
          errorItem.message.match(/Forbidden/) &&
          errorItem.extensions.response.statusCode === 403,
      ),
    ).toBeTruthy();
  });

  it("should pass with valid access to resource role", async () => {
    const token = await (
      await app.resolve(KeycloakPrepService)
    ).getUserToken(UserType.RESOURCE_ACCESS_USER);

    const response = await queryGraphQLEndpoint(
      app,
      gql`
        query {
          resourceRole
        }
      `,
      token,
    );

    expect(response.body.data.resourceRole).toBe("resourceRole");
  });

  afterEach(async () => {
    await app.close();
  });
});
