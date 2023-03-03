import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'fastify-utils',
  entry: {
    index: 'src/compiler/index.ts',
  },
  format: ['esm', 'cjs'],
  outDir: 'compiler',
  dts: true,
  minify: false,
  treeshake: false,
  splitting: false,
  external: [
    'fastify',
    'esbuild',
    '@fastify/env',
    '@fastify/middie',
    '@fastify/cors',
    '@kiwilan/filesystem',
  ],
})
