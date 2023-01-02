import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'fastify-utils',
  entry: {
    index: 'src/index.ts',
    build: 'src/build/build.js',
    esbuild: 'src/build/esbuild.ts',
  },
  format: ['cjs'],
  dts: true,
  minify: false,
  treeshake: true,
  splitting: true,
})
