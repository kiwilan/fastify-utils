import glob from 'tiny-glob'
import { build } from 'esbuild'
import esbuildPluginPino from 'esbuild-plugin-pino'
import Utils from './Utils'

export default class BuildPackage {
  public static make() {
    const config = async () => {
      const entryPoints = await glob('src/**/*.ts')

      return build({
        entryPoints,
        logLevel: 'info',
        outdir: 'build',
        bundle: true,
        minify: true,
        platform: 'node',
        target: 'esnext',
        format: 'esm',
        define: {
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
        plugins: [esbuildPluginPino({ transports: ['pino-pretty'] })],
      })
    }

    return config()
  }

  public static async tsconfig(path = '.fastify/tsconfig.json') {
    const config = {
      compilerOptions: {
        target: 'ESNext',
        module: 'ESNext', // "CommonJS" or "ESNext"
        moduleResolution: 'Node',
        lib: ['DOM', 'DOM.Iterable', 'ESNext'],
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        strict: true,
        resolveJsonModule: true,
        strictNullChecks: true,
        noImplicitReturns: true,
        noImplicitAny: true,
        allowJs: true,
        experimentalDecorators: true,
        useDefineForClassFields: true,
        outDir: './dist',
        paths: {
          '~/*': ['./src/*'],
          '@/*': ['./*'],
        },
      },
    }

    const rootConfig = {
      extends: './.fastify/tsconfig.json',
      include: ['src/**/*.ts'],
    }

    const directory = path.split('/').slice(0, -1).join('/')
    await Utils.createDirIfNotExists(directory)
    await Utils.createNewFile(path, JSON.stringify(config, null, 2))
    if (!Utils.checkIfExists('.tsconfig.json'))
      await Utils.createNewFile('.tsconfig.json', JSON.stringify(rootConfig, null, 2))
    Utils.addToGitIgnore(directory)

    return config
  }
}
