# Changelog

## [2.1.0](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/compare/v2.0.1...v2.1.0) (2023-01-16)


### Features

* added support for built-in public endpoints ([26ac114](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/26ac114bf376b3007865c05a7e5740671c661b92))
* bumped packaged version ([a298fd6](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/a298fd6fcf5105bf27d872809316bffa662409a1))

## [2.0.1](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/compare/v2.0.0...v2.0.1) (2023-01-16)


### Bug Fixes

* added missing auth guard builder dependencies ([1017fe1](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/1017fe15dee8b63f9bbb49cb4c604af275d8b075))

## [2.0.0](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/compare/v1.1.1...v2.0.0) (2023-01-03)


### ⚠ BREAKING CHANGES

* Changed the decorator input type from RoleDefinition to simpler array of strings, removing the need for specifying "realm:" or "resource:"

### Features

* split resource and realm roles to simplify adding roles ([c8aaf67](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/c8aaf6761baf9064be572fbb780fa358d3413a2e))

## [1.1.1](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/compare/v1.1.0...v1.1.1) (2023-01-03)


### Bug Fixes

* removed unused dependencies ([4a79b91](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/4a79b9198f83da7e4ca42417358b41ec47e8ad57))

## [1.1.0](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/compare/v1.0.2...v1.1.0) (2023-01-03)


### Features

* added environment config documentation to package ([26024d5](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/26024d50cca8efb577c665706e3a7916ddd40b48))

## [1.0.2](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/compare/v1.0.1...v1.0.2) (2023-01-02)


### Bug Fixes

* fixed publish step ([3315b5f](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/3315b5f0dd7fec619f44ccebe0079f169bc2c808))

## [1.0.1](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/compare/v1.0.0...v1.0.1) (2023-01-02)


### Bug Fixes

* added keycloak docker step to publish action ([d99f690](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/d99f6905dc05e916bc130fce34e0a57d732558c7))

## 1.0.0 (2023-01-02)


### Features

* added documentation ([4ef9944](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/4ef9944f32a69ee6b0bd8cc573e27e482edaa93e))
* added oidc validation and role guards ([f6d17e5](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/f6d17e5ed1479f4f5dd8ecd7e2102059504758b4))


### Bug Fixes

* fixed incorrect name and missing description ([d27052b](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/d27052b64bc389a147d4ded806ffa485b8067d39))
* fixed installation part of documentation ([c48cef4](https://github.com/flowcore-io/library-nestjs-oidc-protect-ts/commit/c48cef48b1fdaf0ada6af25e122dceebd77932fa))

## [2.3.0](https://github.com/flowcore-io/library-flowcore-microservice-ts/compare/v2.2.0...v2.3.0) (2022-12-21)


### Features

* added observability module with tracer ([25839ae](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/25839ae5ce41fcae4a8f35d548bec513784489c4))


### Bug Fixes

* added missing observability export ([1f280d4](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/1f280d48cc2ad47616b3ee53003e7ed50c60af39))
* fixed missing metrics export ([d71124b](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/d71124b4f95583669a3790150f89f41175bb385e))

## [2.2.0](https://github.com/flowcore-io/library-flowcore-microservice-ts/compare/v2.1.0...v2.2.0) (2022-12-21)


### Features

* added metrics module ([386d129](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/386d129dcf5bbe1428e359df5313bc983ea268a4))

## [2.1.0](https://github.com/flowcore-io/library-flowcore-microservice-ts/compare/v2.0.2...v2.1.0) (2022-12-21)


### Features

* removed health controller added export of HealthService ([bf46df6](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/bf46df6e36a2f8b70cc666663999450474bcf2d9))

## [2.0.2](https://github.com/flowcore-io/library-flowcore-microservice-ts/compare/v2.0.1...v2.0.2) (2022-12-20)


### Bug Fixes

* fixed build script typo ([fbb57e3](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/fbb57e3db946f0c77ee209971cbd0da9c21a77d0))

## [2.0.1](https://github.com/flowcore-io/library-flowcore-microservice-ts/compare/v2.0.0...v2.0.1) (2022-12-20)


### Bug Fixes

* added missing nestjs cli dev dependency ([84cd538](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/84cd538df5d5a022db820c2b95944de5315448e4))

## [2.0.0](https://github.com/flowcore-io/library-flowcore-microservice-ts/compare/v1.0.3...v2.0.0) (2022-12-20)


### ⚠ BREAKING CHANGES

* switched back to single entry point due to NestJS and Vite/Esbuild incompatibilities.

### Features

* added Health check module ([0015bd6](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/0015bd6fbc355c7bde6be970a170010a9abf628b))
* changed from vite and esbuild back to webpack ([aa5fb12](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/aa5fb129f9674bdbc922952e85697c4a6e1679d9))

## [1.0.3](https://github.com/flowcore-io/library-flowcore-microservice-ts/compare/v1.0.2...v1.0.3) (2022-12-19)


### Bug Fixes

* added registry to setup node ([c544b3d](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/c544b3dde7d958576320eb51211492a8ad267413))

## [1.0.2](https://github.com/flowcore-io/library-flowcore-microservice-ts/compare/v1.0.1...v1.0.2) (2022-12-19)


### Bug Fixes

* added registry to setup node ([57de47b](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/57de47bd8144378f89f8251fca63f68b380a8f94))

## [1.0.1](https://github.com/flowcore-io/library-flowcore-microservice-ts/compare/v1.0.0...v1.0.1) (2022-12-19)


### Bug Fixes

* changed to npm publish ([f436dbb](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/f436dbb0dff2292435873a1e2625425b55e0de96))

## 1.0.0 (2022-12-19)


### Features

* initial version with config and logger ([6693f78](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/6693f78431287f0e9371d399c933454a66e46af0))


### Bug Fixes

* added checkout to release please step for name extraction ([1be66d3](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/1be66d35cfd7b827a93c890bc6c0334d892578f7))
* moved workflows to the correct place ([de73abc](https://github.com/flowcore-io/library-flowcore-microservice-ts/commit/de73abccbd490dac32d170c2e8e16db341f0f3e7))
