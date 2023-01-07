import glob from 'tiny-glob'
import type { BuildResult } from 'esbuild'
import { build } from 'esbuild'
import esbuildPluginPino from 'esbuild-plugin-pino'
import { FileUtils, FileUtilsPromises } from '../utils'
import PathUtils from '../utils/PathUtils'
import type { ReplaceInFileBulk } from '../types'

interface DotenvJson {
  dotenv: string[]
}

export default class BuildPackage {
  protected constructor(
    public definitions: string[] = [],
    public routes: string[] = [],
    public config?: BuildResult,
  ) {}

  public static async make(isDev = false) {
    const build = new BuildPackage()
    await build.createTsConfig()

    build.definitions = await build.setDotenv()
    build.routes = await build.setRoutes()
    await build.replaceEnums()

    if (!isDev)
      build.config = await build.setEsbuild()
  }

  private async setDotenv(): Promise<string[]> {
    const path = PathUtils.getFromRoot('config.fastify.json')
    const isExists = await FileUtilsPromises.checkIfFileExists(path)
    const configStart = {
      $schema: './node_modules/fastify-utils/lib/schema.json',
      title: 'User',
      type: 'object',
      dotenv: ['USER'],
      additionalProperties: [
        {
          name: 'name',
        },
      ],
    }

    if (!isExists) {
      console.warn('`config.fastify.json` not found')
      await FileUtilsPromises.createFile(path, JSON.stringify(configStart, null, 2))
    }

    const dotenvFile = await FileUtilsPromises.readFile(path)
    const json: DotenvJson = JSON.parse(dotenvFile.toString())
    console.log(json.dotenv)

    const raw = await FileUtilsPromises.readFile(path)
    let rawList = raw.toString().split('\n')
    rawList = rawList.filter(el => el)

    return rawList
  }

  private async setRoutes(): Promise<string[]> {
    const routesRaw = PathUtils.getFromRoot('src/routes')
    const isExists = await FileUtilsPromises.checkIfDirExists(routesRaw)

    if (!isExists)
      console.warn('`src/routes` not found')

    const routesList: { name: string; route: string }[] = []
    const files = await FileUtilsPromises.readDir(routesRaw, 'ts')

    files.forEach((element) => {
      const originalName = element.split('.')[0]
      let name = originalName
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

      routesList.push({
        name: originalName,
        route: routeName,
      })
    })

    return routesList.map(el => el.route)
  }

  private async replaceEnums() {
    console.log('Replacing enums...')
    const typesCache = PathUtils.getFromPackage('index.d.ts.cache')
    const jsCache = PathUtils.getFromPackage('index.js.cache')

    const haveTypesCache = await FileUtilsPromises.checkIfFileExists(typesCache)
    const haveJsCache = await FileUtilsPromises.checkIfFileExists(jsCache)
    if (!haveTypesCache) {
      const types = await FileUtilsPromises.readFile(PathUtils.getFromPackage('index.d.ts'))
      FileUtils.createFile(typesCache, types)
    }
    if (!haveJsCache) {
      const js = await FileUtilsPromises.readFile(PathUtils.getFromPackage('index.js'))
      FileUtils.createFile(jsCache, js)
    }

    const replaceTypes: ReplaceInFileBulk[] = [
      {
        from: 'SAMPLE_DOTENV = 0\n',
        to: this.definitions.map(el => `${el} = 0,`).join('\n'),
      },
      {
        from: 'SAMPLE_ENDPOINT = 0\n',
        to: this.routes.map(el => `'${el}' = 0,`).join('\n'),
      },
    ]
    FileUtils.replaceInFileBulk(typesCache, PathUtils.getFromPackage('index.d.ts'), replaceTypes)

    const replaceJs: ReplaceInFileBulk[] = [
      {
        from: 'var DotEnvEnum = /* @__PURE__ */ ((DotEnvEnum2) => {\n',
        to: `var DotEnvEnum = ((DotEnvEnum2) => {\n${this.definitions.map(el => `DotEnvEnum2[DotEnvEnum2["${el}"] = 0] = "${el}";`).join('\n')}`,
      },
      {
        from: 'var EndpointEnum = /* @__PURE__ */ ((EndpointEnum2) => {\n',
        to: `var EndpointEnum = ((EndpointEnum2) => {\n${this.routes.map(el => `EndpointEnum2[EndpointEnum2["${el}"] = 0] = "${el}";`).join('\n')}`,
      },
      {
        from: 'DotEnvEnum2[DotEnvEnum2["SAMPLE_DOTENV"] = 0] = "SAMPLE_DOTENV";',
        to: '',
      },
      {
        from: 'EndpointEnum2[EndpointEnum2["SAMPLE_ENDPOINT"] = 0] = "SAMPLE_ENDPOINT";',
        to: '',
      },
    ]
    FileUtils.replaceInFileBulk(jsCache, PathUtils.getFromPackage('index.js'), replaceJs)
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
