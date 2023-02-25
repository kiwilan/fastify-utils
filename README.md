# Fastify Utils

[![npm](https://img.shields.io/npm/v/@kiwilan/fastify-utils.svg?style=flat-square&color=CB3837&logo=npm&logoColor=ffffff&label=npm)](https://www.npmjs.com/package/@kiwilan/fastify-utils)

Fastify Utils is a collection of utilities for [fastify](https://www.fastify.io/).

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
touch build.ts ; touch config.js ; touch .eslintrc ; touch .env.example
```

```bash
cp .env.example .env
```

### Dev setup

In `config.js`:

```javascript
import { Compiler } from "fastify-utils";

Compiler.make(true);
```

In `package.json`:

```json
{
  "scripts": {
    "postinstall": "npm run config",
    "config": "node config.js",
    "dev": "npm run config && tsx watch src .env"
  }
}
```

In `src/index.ts`:

```typescript
import { Server } from "fastify-utils";

const server = Server.make();

server.start();
```

#### Routes

In `src/routes/root.ts`:

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

And for `src/routes/posts.ts`:

```typescript
import { Route } from "fastify-utils";

export default Route.make({
  method: "GET",
  url: "/posts",
  handler: async (request, reply) => {
    return { posts: [] };
  },
});
```

### Build setup

In `build.ts`:

```typescript
import { Compiler } from "fastify-utils";

Compiler.make();
```

In `package.json`:

```json
{
  "scripts": {
    "build": "rimraf build && npm run config && tsx build.ts && npm run check:types",
    "check:types": "tsc --noEmit"
  }
}
```

### Production setup

In `package.json`:

```json
{
  "scripts": {
    "clean": "rimraf build && rimraf node_modules && pnpm install",
    "preview": "npm run build && node build/index.mjs",
    "pm2": "pm2 start --name 'social-oembed' './build/index.mjs'"
  }
}
```

## Build

```bash
pnpm build ; pnpm pack ; cp kiwilan-fastify-utils-0.0.1.tgz ~/kiwilan-fastify-utils-0.0.1.tgz
```
