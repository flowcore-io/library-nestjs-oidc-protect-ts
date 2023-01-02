![Build](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/actions/workflows/publish.yml/badge.svg)

# NestJS Oidc-Protect

A NestJS OpenID Connect library that can validate a token and protect routes with Auth and Role Guards. This is build to
use the [@flowcore/microservice](https://www.npmjs.com/package/@flowcore/microservice) library for configuration.

## Installation

install with npm:

```bash
npm install @flowcore/nestjs-library @flowcore/microservice
```

or yarn:

```bash
yarn add @flowcore/nestjs-library @flowcore/microservice
```

> If you are using GraphQL, you also need to install the `@nestjs/graphql` package.

## Configuration

Import the OidcProtectModule into your NestJS application and configure it with your Keycloak server's details:

```typescript
import {OidcProtectModuleBuilder, OidcProtectConfigurationSchema} from '@flowcore/oidc-protect';
import {ConfigModule, ConfigFactory} from '@flowcore/microservice';
import {AuthGuardBuilder} from "./auth-guard.builder";

const config = ConfigModule.forRoot(
  new ConfigFactory()
    // ...other configuration schemas
    .withSchema(OidcProtectConfigurationSchema)
  // ...other configuration schemas,
);

@Module({
  imports: [
    config,
    // ...other modules
    new OidcProtectModuleBuilder().withConfig(config).build(),
  ],
  providers: [
    ...new AuthGuardBuilder().usingRoleGuard().build(),
  ],
})
export class AppModule {
}
```

## Usage

The `AuthGuard` is global and will protect all routes by default. You can use the `@Public()` decorator to exclude
routes from the AuthGuard.

```typescript
import {Public} from '@flowcore/oidc-protect';
import {Controller, Get} from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Public()
  getHello(): string {
    return 'Hello World!';
  }
}
```

You can also use the `@Roles()` decorator to protect routes with a RoleGuard. The `@Roles()` decorator accepts a list of
roles. If the user has one of the roles, the route will be accessible.

```typescript
import {Roles} from '@flowcore/oidc-protect';
import {Controller, Get} from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Roles({
    roles: ['realm:admin', 'resource:write'],
  })
  getHello(): string {
    return 'Hello World!';
  }
}
```

Resource will be swapped out for the `resourceId` configured in the `OidcProtectModule`. If no resourceId is configured,
the `resource_access` claim will never go through and will fail the guard.

> The `resource` roles refer to the `resource_access` field in the token. The `realm` roles refer to the `realm_access`
> field in the token.

We hope you find this library useful in your NestJS projects!

## Development

```bash
yarn install
```

or with npm:

```bash
npm install
```