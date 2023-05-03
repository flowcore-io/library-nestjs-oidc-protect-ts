import { NestApplicationBuilder } from "@jbiskur/nestjs-test-utilities";
import { CACHE_MANAGER, INestApplication, Module } from "@nestjs/common";
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
import { LoggerModulePlugin } from "@flowcore/testing-microservice";
import {
  KeycloakPrepService,
  UserType,
} from "./fixtures/keycloak/keycloak-prep.service";
import { DocumentNode, print } from "graphql/language";
import gql from "graphql-tag";
import * as path from "path";
import { WellKnownController } from "./fixtures/wellknown.controller";
import jwtDecode from "jwt-decode";
import { PersonResolver } from "./fixtures/complex.resolver";
import { CacheModule } from "@nestjs/cache-manager";
import { KeycloakPrepModule } from "./fixtures/keycloak/keycloak-prep.module";

const config = ConfigModule.forRoot(
  new ConfigFactory().withSchema(OidcProtectConfigurationSchema),
);

const cache = CacheModule.register();

@Module({
  imports: [
    config,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.join(__dirname, "test.schema.gql"),
      fieldResolverEnhancers: ["guards"],
    }),
    cache,
    new OidcProtectModuleBuilder()
      .withConfig(config)
      .withCache(cache, CACHE_MANAGER)
      .build(),
    KeycloakPrepModule.registerAsync({
      imports: [config],
      inject: [ConfigService],
      useFactory: (config) => ({
        wellKnownUrl: config.schema.wellKnownUrl,
        baseUrl: "http://localhost:8080",
      }),
    }),
  ],
  controllers: [WellKnownController],
  providers: [
    TestResolver,
    PersonResolver,
    ...new AuthGuardBuilder().usingRoleGuard().usingResourceGuard().build(),
  ],
})
class AppModuleWithCache {}

@Module({
  imports: [
    config,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.join(__dirname, "test.schema.gql"),
      fieldResolverEnhancers: ["guards"],
    }),
    new OidcProtectModuleBuilder().withConfig(config).build(),
    KeycloakPrepModule.registerAsync({
      imports: [config],
      inject: [ConfigService],
      useFactory: (config) => ({
        wellKnownUrl: config.schema.wellKnownUrl,
        baseUrl: "http://localhost:8080",
      }),
    }),
  ],
  controllers: [WellKnownController],
  providers: [
    TestResolver,
    PersonResolver,
    ...new AuthGuardBuilder().usingRoleGuard().usingResourceGuard().build(),
  ],
})
class AppModuleWithoutCache {}

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
  describe("with cache", () => {
    let app: INestApplication;

    beforeEach(async () => {
      app = await new NestApplicationBuilder()
        .withTestModule((testModule) =>
          testModule.withModule(AppModuleWithCache),
        )
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

    it("should fail with invalid authorization token", async () => {
      const response = await queryGraphQLEndpoint(
        app,
        gql`
          query {
            testPerson {
              id
              firstName
              lastName
              fullName
            }
          }
        `,
        "invalid",
      );

      expect(response.body.errors).toBeDefined();
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

    it("should pass for public decorated endpoints", async () => {
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

    it("should pass for built-in public endpoints", async () => {
      await supertest(app.getHttpServer()).get("/health").expect(200);
      await supertest(app.getHttpServer()).get("/metrics").expect(200);
      await supertest(app.getHttpServer()).get("/not-known").expect(401);
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

    it("should get access to authenticated user", async () => {
      const token = await (
        await app.resolve(KeycloakPrepService)
      ).getUserToken(UserType.TEST_USER);

      const decoded: any = jwtDecode(token);

      const response = await queryGraphQLEndpoint(
        app,
        gql`
          query {
            authenticatedUser
          }
        `,
        token,
      );

      expect(response.body.data.authenticatedUser).toBe(
        decoded.preferred_username,
      );
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

  describe("without cache", () => {
    let app: INestApplication;

    beforeEach(async () => {
      app = await new NestApplicationBuilder()
        .withTestModule((testModule) =>
          testModule.withModule(AppModuleWithoutCache),
        )
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

    afterEach(async () => {
      await app.close();
    });
  });
});
