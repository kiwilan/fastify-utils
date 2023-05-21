import type { BuildResult, Plugin } from 'esbuild'
import { build } from 'esbuild'
import glob from 'tiny-glob'
import esbuildPluginPino from 'esbuild-plugin-pino'
import { nativeNodeModules } from '../plugins'

export interface EsbuildConfigOpts {
  plugins?: Plugin[]
  external?: string[]
  useNativeNodeModules?: boolean
  callback?: () => Promise<void>
}

export class EsbuildConfig {
  public static async make(opts: EsbuildConfigOpts): Promise<BuildResult> {
    const entryPoints = await glob('src/**/*.ts')
    if (!opts.plugins)
      opts.plugins = []

    if (opts.useNativeNodeModules && opts.plugins)
      opts.plugins.push(nativeNodeModules)

    opts.plugins.push(
      esbuildPluginPino({ transports: ['pino-pretty'] }),
    )

    if (opts.callback)
      await opts.callback()

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
      plugins: opts.plugins,
      external: opts.external,
    })
  }
}
