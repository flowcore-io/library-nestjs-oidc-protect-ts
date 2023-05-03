![Build](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/actions/workflows/publish.yml/badge.svg)

# NestJS Oidc-Protect

A NestJS OpenID Connect library that can validate a token and protect routes with Auth and Role Guards. This is build to
use the [@flowcore/microservice](https://www.npmjs.com/package/@flowcore/microservice) library for configuration.

## Installation

install with npm:

```bash
npm install @flowcore/nestjs-oidc-protect @flowcore/microservice
```

or yarn:

```bash
yarn add @flowcore/nestjs-oidc-protect @flowcore/microservice
```

> If you are using GraphQL, you also need to install the `@nestjs/graphql` package.

## Configuration

Import the OidcProtectModule into your NestJS application and configure it with your Keycloak server's details:

```typescript
import { OidcProtectModuleBuilder, OidcProtectConfigurationSchema } from '@flowcore/nestjs-oidc-protect';
import { ConfigModule, ConfigFactory } from '@flowcore/microservice';
import { AuthGuardBuilder } from "./auth-guard.builder";

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
    ...new AuthGuardBuilder()
      .usingRoleGuard()
      .usingResourceGuard()
      .build(),
  ],
})
export class AppModule {
}
```

This can then be configured in a service with the following environment variables

| Environment Variable | Description                                                                                    |   Type   | Default Value | Required |
|----------------------|------------------------------------------------------------------------------------------------|:--------:|---------------|:--------:|
| OIDC_WELLKNOWN_URL   | The wellknown configuration endpoint value for the authentication server                       |  `url`   |               |    X     |
| OIDC_RESOURCE_ID     | The resource ID configured for this service, this is required for `resource_access` validation | `string` |               |          |

## Usage

The `AuthGuard` is global and will protect all routes by default. You can use the `@Public()` decorator to exclude
routes from the AuthGuard.

```typescript
import { Public } from '@flowcore/nestjs-oidc-protect';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Public()
  getHello(): string {
    return 'Hello World!';
  }
}
```

You can also use the `@RealmRoles()` or `@ResourceRoles` decorators to protect routes with a RoleGuard.
The `@RealmRoles()` and `@ResourceRoles()` decorators accepts a list of
roles. If the user has one of the roles, the route will be accessible.

```typescript
import { Roles } from '@flowcore/nestjs-oidc-protect';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @RealmRoles(['admin', 'write'])
  getHello(): string {
    return 'Hello World!';
  }

  @ResourceRoles(['read', 'write'])
  getHello(): string {
    return 'Hello World!';
  }
}
```

Resource will be swapped out for the `resourceId` configured in the `OidcProtectModule`. If no resourceId is configured,
the `resource_access` claim will never go through and will fail the guard.

> The `resource` roles refer to the `resource_access` field in the token. The `realm` roles refer to the `realm_access`
> field in the token.

> It is not possible to use `@RealmRoles()` and `@ResourceRoles()` on the same route.

For public endpoints like `/health` or `/metrics` you can use the built-in public endpoints are used to keep these paths
open. If you want to override these defaults or disable them, you can do so by configuring the `OidcProtectModule` using
the `OidcProtectModuleBuilder`:

```typescript
@Module({
  imports: [
    config,
    // ...other modules
    new OidcProtectModuleBuilder()
      .withConfig(config)
      .noPublicEndpoints() // for disabling the built-in public endpoints
      .overridePublicEndpoints(
        [
          '/health',
          '/metrics',
          '/healthz',
        ],
      )
      .build(),
  ],
  // ... other provider, controllers etc.
})
export class AppModule {
}
```

to optimize the performance you can specify a cache using the `withCache()` method on the `OidcProtectModuleBuilder`:

```typescript
import { CACHE_MANAGER, CacheModule } from "@nestjs/cache-manager";

const cacheModule = CacheModule.register();

@Module({
  imports: [
    config,
    // ...other modules
    cacheModule,
    new OidcProtectModuleBuilder()
      .withConfig(config)
      .withCache(cacheModule, CACHE_MANAGER)
      .build(),
  ],
  // ... other provider, controllers etc.
})
export class AppModule {
}
```

> This supports the same cache managers as the `@nestjs/cache-manager` module.

To get access to the user information in the request, you can use the `@AuthenticatedUser()` decorator:

```typescript
import { AuthenticatedUser } from '@flowcore/nestjs-oidc-protect';
import { Roles } from '@flowcore/nestjs-oidc-protect';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @RealmRoles(['admin', 'write'])
  getHello(@AuthenticatedUser() user: any /* change to match your token */): string {
    return 'Hello World!';
  }
}
```

> This also works with @Resolvers() in GraphQL.

We hope you find this library useful in your NestJS projects!

## Development

```bash
yarn install
```

or with npm:

```bash
npm install
```