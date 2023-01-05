import { extname, join } from 'path'
import { existsSync, readFileSync } from 'fs'
import { readdir } from 'fs/promises'
import glob from 'tiny-glob'
import type { BuildResult } from 'esbuild'
import { build } from 'esbuild'
import esbuildPluginPino from 'esbuild-plugin-pino'
import { FileUtils } from '../utils'

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
      build.definitions = build.setDotenv()
      build.routes = await build.setRoutes()
    }
    else {
      build.config = await build.setEsbuild()
    }
  }

  private setDotenv(): string[] {
    const root = process.cwd()
    const file = join(root, 'src/dotenv')

    if (!existsSync(file))
      throw new Error('File dotenv not found')

    let raw = readFileSync(file).toString().split('\n')
    raw = raw.filter(el => el)

    const type = join(FileUtils.dirname, 'index.d.ts')
    if (FileUtils.checkIfExists(type)) {
      const dotenvList = raw.map(el => `${el} = 0,`).join('\n')
      FileUtils.replaceInFile(
        type,
        'SAMPLE_DOTENV = 0',
        dotenvList,
      )
    }

    return raw
  }

  private async setRoutes(): Promise<string[]> {
    const root = process.cwd()
    const routesRaw = join(root, 'src/routes')

    if (!existsSync(routesRaw))
      console.warn('`src/routes` not found')

    const files = await readdir(routesRaw)
    const list = files.filter(e => extname(e).toLowerCase() === '.ts')

    const routes: string[] = []
    list.forEach((element) => {
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

      routes.push(routeName)
    })

    const type = join(FileUtils.dirname, 'index.d.ts')
    if (FileUtils.checkIfExists(type)) {
      const endpointList = routes.map(el => `'${el}' = 0,`).join('\n')
      console.log(endpointList)

      FileUtils.replaceInFile(
        type,
        // eslint-disable-next-line @typescript-eslint/quotes
        `'/' = 0`,
        endpointList,
      )
    }

    return routes
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
    await FileUtils.createDirIfNotExists(directory)
    await FileUtils.createNewFile(path, JSON.stringify(config, null, 2))
    if (!FileUtils.checkIfExists('tsconfig.json'))
      await FileUtils.createNewFile('tsconfig.json', JSON.stringify(rootConfig, null, 2))
    FileUtils.addToGitIgnore(directory)
  }
}
