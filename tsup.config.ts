import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'fastify-utils',
  entry: {
    index: 'src/index.ts',
    syn: 'src/syn.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  minify: false,
  treeshake: true,
  splitting: true,
})
