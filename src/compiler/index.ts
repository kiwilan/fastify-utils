import type { BuildResult } from 'esbuild'
import type { Metadata } from './build'
import { createTsConfig, generateDefinitions, generateEnvironment, generateMetadata, generateRoutes } from './build'
import type { EsbuildConfigOpts } from './build/esbuild_config'
import { esbuildConfig } from './build/esbuild_config'

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
    // await replaceEnums(build.definitions, build.routes)
    await generateDefinitions(build.definitions, build.routes)
    build.metadata = await generateMetadata()

    const isDev = process.env.NODE_ENV
      ? process.env.NODE_ENV === 'development'
      : true
    if (!isDev)
      build.config = await esbuildConfig(opts)
  }
}
