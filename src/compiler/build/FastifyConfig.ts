import { FsFile, FsPath } from '@kiwilan/filesystem'

export class FastifyConfig {
  public static async make(): Promise<FastifyConfig> {
    const self = new FastifyConfig()

    const path = FsPath.root('.fastify')
    await FsFile.makeDirectory(path)
    await FsFile.addToGitIgnore(path)

    await self.tsConfigExtends()
    await self.tsConfig()
    await self.dotenvSchemaConfig()
    await self.dotenvConfig()

    return self
  }

  private async tsConfigExtends(): Promise<void> {
    const extendsConfig = {
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

    const path = FsPath.root('.fastify/tsconfig.json')

    await FsFile.put(path, JSON.stringify(extendsConfig, null, 2))
  }

  private async tsConfig(): Promise<void> {
    const userConfig = {
      extends: './.fastify/tsconfig.json',
      compilerOptions: {
        paths: {
          '~/*': [
            './src/*',
          ],
          '@/*': [
            './*',
          ],
        },
      },
      include: ['src/**/*.ts'],
    }

    const path = FsPath.root('tsconfig.json')
    const exists = await FsFile.exists(path)

    if (!exists)
      await FsFile.put('tsconfig.json', JSON.stringify(userConfig, null, 2))
  }

  private async dotenvSchemaConfig(): Promise<void> {
    const content = {
      description: 'Core schema meta-schema',
      type: 'object',
      properties: {
        dotenv: {
          type: 'object',
          description: 'A list of environment variables to load from .env files',
          additionalProperties: {
            enum: ['string', 'number', 'boolean', 'array', 'object'],
          },
        },
      },
      default: {},
    }

    const path = FsPath.root('.fastify/config.schema.json')
    await FsFile.put(path, JSON.stringify(content, null, 2))
  }

  private async dotenvConfig(): Promise<void> {
    const content = {
      $schema: './.fastify/config.schema.json',
      dotenv: {},
    }

    const path = FsPath.root('config.fastify.json')
    const exists = await FsFile.exists(path)

    if (exists)
      return

    await FsFile.put(path, JSON.stringify(content, null, 2))
  }
}
