import { build } from 'esbuild'
import glob from 'tiny-glob'
import { nativeNodeModules } from '../plugins'

export interface EsbuildConfigOpts {
  plugins?: any[]
  external?: string[]
  useExternal?: boolean
}

export const esbuildConfig = async (opts: EsbuildConfigOpts = { plugins: [], external: [], useExternal: false }): Promise<any> => {
  const config = async () => {
    const entryPoints = await glob('src/**/*.ts')
    if (opts.useExternal && opts.plugins)
      opts.plugins.push(nativeNodeModules)

    return build({
      entryPoints,
      logLevel: 'info',
      outdir: 'build',
      bundle: true,
      minify: true,
      splitting: true,
      platform: 'node',
      target: 'esnext',
      format: 'esm',
      define: {
        'process.env.NODE_ENV': '"production"',
        'process.env.NODE_ENV_LOG': '"production"',
      },
      outExtension: { '.js': '.mjs' },
      sourcemap: false,
      banner: {
        js: `
  import { createRequire } from 'module';
  import path from 'path';
  import { fileURLToPath } from 'url';
  const require = createRequire(import.meta.url);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  `,
      },
      // esbuildPluginPino({ transports: ['pino-pretty'] })
      plugins: opts.plugins,
      external: opts.external,
    })
  }

  return await config()
}
