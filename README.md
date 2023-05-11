# Kiwilan's fastify-utils

[![node][node-version-src]][node-version-href]
[![fastify][fastify-version-src]][fastify-version-href]
[![typescript][typescript-version-src]][typescript-version-href]

[![version][version-src]][version-href]
[![downloads][downloads-src]][downloads-href]
[![license][license-src]][license-href]

[![tests][tests-src]][tests-href]
[![codecov][codecov-src]][codecov-href]

Collection of utilities for [fastify](https://www.fastify.io/) framework, built to improve DX.

<p align="center">
  <a href="https://github.com/kiwilan/fastify-utils" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/kiwilan/fastify-utils/main/public/og.jpg">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/kiwilan/fastify-utils/main/public/og.jpg">
       <img alt="Social oEmbed" src="https://raw.githubusercontent.com/kiwilan/fastify-utils/main/public/og.jpg" width="750" height="150" style="max-width: 100%;">
    </picture>
  </a>
</p>

<p align="center">
  <strong>API to offer OpenGraph meta or oEmbed media.</strong>
</p>

<p align="center">
  <a href="https://nodejs.org/en"><img src="https://img.shields.io/static/v1?label=Node.js&message=v16.x&color=339933&style=flat-square&logo=node.js&logoColor=ffffff" alt="Node.js"></a>
  <a href="https://www.fastify.io"><img src="https://img.shields.io/static/v1?label=Fastify&message=v4.x&color=000000&style=flat-square&logo=fastify&logoColor=ffffff" alt="Fastify"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/static/v1?label=TypeScript&message=v4.8.x&color=3178C6&style=flat-square&logo=typescript&logoColor=ffffff" alt="TypeScript"></a>
</p>
<p align="center">
  <a href="https://esbuild.github.io"><img src="https://img.shields.io/static/v1?label=esbuild&message=ESM&color=FFCF00&style=flat-square&logo=esbuild&logoColor=ffffff" alt="esbuild"></a>
  <a href="https://gitlab.com/ewilan-riviere/fastify-utils/-/pipelines"><img src="https://gitlab.com/ewilan-riviere/fastify-utils/badges/main/pipeline.svg" alt="Pipeline"></a>
  <a href="https://github.com/kiwilan/fastify-utils/actions/workflows/CI.yml"><img src="https://github.com/kiwilan/fastify-utils/actions/workflows/CI.yml/badge.svg" alt="CI"></a>
</p>

## Installation

```bash
npm add @kiwilan/fastify-utils tsx
```

Or with [pnpm](https://pnpm.js.org/):

```bash
pnpm add @kiwilan/fastify-utils tsx
```

## Usage

```bash
touch setup.js ; touch .eslintrc ; touch .env.example
```

```bash
cp .env.example .env
```

### Dev setup

In `.env`:

```bash
LOG_LEVEL=debug      # debug | error | fatal  | info | trace | warn | silent

PORT=3000
BASE_URL=localhost
HTTPS=false

CLUSTER=false
```

In `setup.js`:

```javascript
import { Compiler } from "fastify-utils";

Compiler.make({
  // options
});
```

In `package.json`:

```json
{
  "scripts": {
    "postinstall": "npm run config",
    "config": "node setup.js",
    "dev": "npm run config && NODE_ENV=development tsx watch src .env"
  }
}
```

In `src/index.ts`:

```typescript
import { LocalServer } from "fastify-utils";

LocalServer.run({
  // options
});
```

#### Routes

In `src/routes/index.ts`:

```typescript
import { Route } from "fastify-utils";

export default Route.make({
  method: "GET",
  url: "/",
  handler: async (request, reply) => {
    return { hello: "world" };
  },
});
```

And for `src/routes/api/posts/index.ts`:

```typescript
import { Route } from "fastify-utils";

export default Route.make({
  method: "GET",
  url: "/api/posts", // autocomplete
  handler: async (request, reply) => {
    return { posts: [] };
  },
});
```

#### API key

In `.env`

```bash
# Could be left empty if you don't want to use it
API_KEY=
```

### Build setup

In `package.json`:

```json
{
  "scripts": {
    "build": "rimraf build && npm run config && NODE_ENV=production tsx setup.js && npm run check:types",
    "check:types": "tsc --noEmit"
  }
}
```

### Production setup

In `.env`:

```bash
LOG_LEVEL=error      # debug | error | fatal  | info | trace | warn | silent

PORT=3000 # pm2 port
BASE_URL=domain.com
HTTPS=true
```

In `package.json`:

```json
{
  "scripts": {
    "clean": "rimraf build && rimraf node_modules && pnpm install",
    "start": "node build/index.mjs",
    "pm2": "pm2 start --name 'fastify-utils' './build/index.mjs'"
  }
}
```

## Build

```bash
pnpm package
```

```json
{
  "dependencies": {
    "@kiwilan/fastify-utils": "file:~/kiwilan-fastify-utils-*.tgz"
  }
}
```

## License

[MIT](LICENSE)

[version-src]: https://img.shields.io/npm/v/@kiwilan/fastify-utils.svg?style=flat-square&colorA=18181B&colorB=339933
[version-href]: https://www.npmjs.com/package/@kiwilan/fastify-utils
[fastify-version-src]: https://img.shields.io/badge/dynamic/json?label=Fastify&url=https://raw.githubusercontent.com/kiwilan/fastify-utils/main/package.json&query=dependencies.fastify&style=flat-square&colorA=18181B&colorB=339933
[fastify-version-href]: https://www.fastify.io/
[typescript-version-src]: https://img.shields.io/badge/dynamic/json?label=TypeScript&url=https://raw.githubusercontent.com/kiwilan/fastify-utils/main/package.json&query=devDependencies.typescript&style=flat-square&colorA=18181B&colorB=339933
[typescript-version-href]: https://www.typescriptlang.org/
[node-version-src]: https://img.shields.io/badge/dynamic/json?label=Node.js&url=https://raw.githubusercontent.com/kiwilan/fastify-utils/main/package.json&query=engines.node&style=flat-square&colorA=18181B&colorB=339933
[node-version-href]: https://www.php.net/
[downloads-src]: https://img.shields.io/npm/dt/@kiwilan/fastify-utils.svg?style=flat-square&colorA=18181B&colorB=339933
[downloads-href]: https://www.npmjs.com/package/@kiwilan/fastify-utils
[license-src]: https://img.shields.io/github/license/kiwilan/node-filesystem.svg?style=flat-square&colorA=18181B&colorB=339933
[license-href]: https://github.com/kiwilan/node-filesystem/blob/main/README.md
[tests-src]: https://img.shields.io/github/actions/workflow/status/kiwilan/node-filesystem/run-tests.yml?branch=main&label=tests&style=flat-square&colorA=18181B
[tests-href]: https://github.com/kiwilan/node-filesystem/actions/workflows/run-tests.yml
[codecov-src]: https://codecov.io/gh/kiwilan/node-filesystem/branch/main/graph/badge.svg?token=SHQV8D60YV
[codecov-href]: https://codecov.io/gh/kiwilan/node-filesystem
