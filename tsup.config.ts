import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'fastify-utils',
  entry: {
    index: 'src/lib/index.ts',
    syn: 'src/syn.ts',
  },
  format: ['esm', 'cjs'],
  // outExtension({ format }) {
  //   return {
  //     js: `.${format}.js`,
  //   }
  // },
  dts: true,
  minify: true,
  treeshake: true,
  splitting: true,
  external: [
    'fastify',
    'esbuild',
    '@fastify/env',
    '@fastify/middie',
    '@fastify/cors',
    '@kiwilan/filesystem',
  ],
})
