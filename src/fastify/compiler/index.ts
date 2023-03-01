import type { BuildResult } from 'esbuild'
import { Environment } from '../env'
import type { Metadata } from './build'
import { createTsConfig, esbuildConfig, generateEnvironment, generateMetadata, generateRoutes, replaceEnums } from './build'
import type { EsbuildConfigOpts } from './build/esbuild_config'

export class Compiler {
  protected constructor(
    public definitions: string[] = [],
    public routes: string[] = [],
    public config?: BuildResult,
    public metadata?: Metadata,
  ) {}

  public static async make(opts: EsbuildConfigOpts = {
    plugins: [],
     external: [],
     useNativeNodeModules: false,
     envDebug: false,
  }): Promise<void> {
    const build = new Compiler()

    createTsConfig('.fastify/tsconfig.json')

    build.definitions = await generateEnvironment()
    build.routes = await generateRoutes()
    await replaceEnums(build.definitions, build.routes)
    build.metadata = await generateMetadata()

    const dotenv = Environment.make()

    if (dotenv.system.IS_DEV) {
      if (opts.envDebug) {
        console.error('Environment properties:')
        console.error(dotenv.properties)
        console.error('Environment data:')
        console.error(dotenv.data)
        console.error('Environment system:')
        console.error(dotenv.system)
      }
    }

    if (!dotenv.system.IS_DEV)
      build.config = await esbuildConfig(opts)
  }
}
