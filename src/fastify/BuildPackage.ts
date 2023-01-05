import glob from 'tiny-glob'
import type { BuildResult } from 'esbuild'
import { build } from 'esbuild'
import esbuildPluginPino from 'esbuild-plugin-pino'
import { FileUtils, FileUtilsPromises } from '../utils'
import PathUtils from '../utils/PathUtils'

export default class BuildPackage {
  protected constructor(
    public definitions: string[] = [],
    public routes: string[] = [],
    public config?: BuildResult,
  ) {}

  public static async make(isDev = false) {
    const build = new BuildPackage()
    await build.createTsConfig()

    if (isDev) {
      build.definitions = await build.setDotenv()
      build.routes = await build.setRoutes()
    }
    else {
      build.config = await build.setEsbuild()
    }
  }

  private async setDotenv(): Promise<string[]> {
    const file = PathUtils.getFromRoot('src/dotenv')
    const isExists = await FileUtilsPromises.checkIfFileExists(file)

    if (!isExists)
      throw new Error('File dotenv not found')

    const raw = await FileUtilsPromises.readFile(file)
    let rawList = raw.toString().split('\n')
    rawList = rawList.filter(el => el)

    await FileUtilsPromises.replaceInFile(
      PathUtils.getFromPackage('index.d.ts'),
      'SAMPLE_DOTENV = 0',
      rawList.map(el => `${el} = 0,`).join('\n'),
    )

    return rawList
  }

  private async setRoutes(): Promise<string[]> {
    const routesRaw = PathUtils.getFromRoot('src/routes')
    const isExists = await FileUtilsPromises.checkIfDirExists(routesRaw)

    if (!isExists)
      console.warn('`src/routes` not found')

    const routesList: string[] = []
    const files = await FileUtilsPromises.readDir(routesRaw, 'ts')

    files.forEach((element) => {
      let name = element.split('.')[0]
      const params = name.includes('_') ? name.split('_') : []
      if (params.length)
        name = params.shift() || element

      let routeName = `/${name}`
      if (routeName === '/root')
        routeName = '/'

      if (params.length) {
        params.forEach((param) => {
          routeName += `/:${param}`
        })
      }

      routesList.push(routeName)
    })

    await FileUtilsPromises.replaceInFile(
      PathUtils.getFromPackage('index.d.ts'),
      'SAMPLE_ENDPOINT = 0',
      routesList.map(el => `'${el}' = 0,`).join('\n'),
    )

    return routesList
  }

  private async setEsbuild() {
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

    return await config()
  }

  private async createTsConfig(path = '.fastify/tsconfig.json') {
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
      include: [
        'src/**/*.ts',
      ],
    }

    const rootConfig = {
      extends: './.fastify/tsconfig.json',
      include: ['src/**/*.ts'],
    }

    const directory = path.split('/').slice(0, -1).join('/')
    FileUtils.createDirIfNotExists(directory)
    FileUtils.createFile(path, JSON.stringify(config, null, 2))
    if (!FileUtils.checkIfExists('tsconfig.json'))
      FileUtils.createFile('tsconfig.json', JSON.stringify(rootConfig, null, 2))
    FileUtils.addToGitIgnore(directory)
  }
}
