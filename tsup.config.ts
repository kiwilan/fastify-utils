import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'fastify-utils',
  entry: {
    index: 'src/index.ts',
    syn: 'src/syn.ts',
  },
  format: ['esm', 'cjs'],
  // outExtension({ format }) {
  //   return {
  //     js: `.${format}.js`,
  //   }
  // },
  dts: true,
  minify: false,
  treeshake: true,
  splitting: true,
})
