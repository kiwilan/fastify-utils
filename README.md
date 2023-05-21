# Fastify utils

<p align="center">
  <a href="https://github.com/kiwilan/fastify-utils" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/kiwilan/fastify-utils/main/public/og.jpg">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/kiwilan/fastify-utils/main/public/og.jpg">
      <img alt="Social oEmbed" src="https://raw.githubusercontent.com/kiwilan/fastify-utils/main/public/og.jpg" width="750" height="100%">
    </picture>
  </a>
</p>

<p align="center">
  <strong>Collection of utilities for <a href="https://www.fastify.io/">fastify</a> framework, built to improve DX.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@kiwilan/fastify-utils"><img src="https://img.shields.io/npm/v/@kiwilan/fastify-utils.svg?style=flat-square&colorA=18181B&colorB=339933" alt="NPM"></a>
  <a href="https://www.npmjs.com/package/@kiwilan/fastify-utils"><img src="https://img.shields.io/npm/dt/@kiwilan/fastify-utils.svg?style=flat-square&colorA=18181B&colorB=339933" alt="Downloads"></a>
  <a href="https://github.com/kiwilan/fastify-utils/blob/main/LICENSE"><img src="https://img.shields.io/github/license/kiwilan/fastify-utils.svg?style=flat-square&colorA=18181B&colorB=339933" alt="License"></a>
</p>
<p align="center">
  <a href="https://www.fastify.io/"><img src="https://img.shields.io/badge/dynamic/json?label=fastify&url=https://raw.githubusercontent.com/kiwilan/fastify-utils/main/package.json&query=dependencies.fastify&style=flat-square&colorA=18181B&colorB=339933" alt="Fastify"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/dynamic/json?label=typescript&url=https://raw.githubusercontent.com/kiwilan/fastify-utils/main/package.json&query=devDependencies.typescript&style=flat-square&colorA=18181B&colorB=339933" alt="TypeScript"></a>
  <a href="https://nodejs.org/en"><img src="https://img.shields.io/badge/dynamic/json?label=node.js&url=https://raw.githubusercontent.com/kiwilan/fastify-utils/main/package.json&query=engines.node&style=flat-square&colorA=18181B&colorB=339933" alt="Node.js"></a>
</p>
<p align="center">
  <a href="https://github.com/kiwilan/fastify-utils/actions/workflows/run-tests.yml"><img src="https://img.shields.io/github/actions/workflow/status/kiwilan/fastify-utils/run-tests.yml?branch=main&label=tests&style=flat-square&colorA=18181B" alt="tests"></a>
  <a href="https://codecov.io/gh/kiwilan/fastify-utils"><img src="https://codecov.io/gh/kiwilan/fastify-utils/branch/main/graph/badge.svg?token=96OXNK5PV5" alt="codecov"></a>
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
touch setup.js
touch .eslintrc
touch .env.example
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
import { Server } from "fastify-utils";

Server.run({
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
    "@kiwilan/fastify-utils": "file:~/kiwilan-fastify-utils.tgz"
  }
}
```

## License

[MIT](LICENSE)
