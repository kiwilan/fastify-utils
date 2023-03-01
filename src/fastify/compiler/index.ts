import type { BuildResult } from 'esbuild'
import { Dotenv } from '../Dotenv'
import type { Metadata } from './build'
import { createTsConfig, esbuildConfig, generateDotenv, generateMetadata, generateRoutes, replaceEnums } from './build'
import type { EsbuildConfigOpts } from './build/esbuild_config'

export class Compiler {
  protected constructor(
    public definitions: string[] = [],
    public routes: string[] = [],
    public config?: BuildResult,
    public metadata?: Metadata,
  ) {}

  public static async make(opts: EsbuildConfigOpts = { plugins: [], external: [], useNativeNodeModules: false }): Promise<void> {
    const build = new Compiler()

    createTsConfig('.fastify/tsconfig.json')

    build.definitions = await generateDotenv()
    build.routes = await generateRoutes()
    await replaceEnums(build.definitions, build.routes)
    build.metadata = await generateMetadata()

    const dotenv = Dotenv.make()
    if (!dotenv.system.IS_DEV)
      build.config = await esbuildConfig(opts)
  }
}