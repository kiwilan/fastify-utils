import type { BuildResult } from 'esbuild'
import { Environment } from '../env'
import type { EsbuildConfigOpts } from './build/EsbuildConfig'
import { EsbuildConfig } from './build/EsbuildConfig'
import type { Metadata } from './build/GenerateMetadata'
import { GenerateMetadata } from './build/GenerateMetadata'
import { FastifyConfig } from './build/FastifyConfig'
import { GenerateRoutes } from './build/GenerateRoutes'

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
  }): Promise<void> {
    const self = new Compiler()

    await FastifyConfig.make()

    await Environment.make()

    self.routes = await GenerateRoutes.make()
    self.metadata = await GenerateMetadata.make()

    const isDev = process.env.NODE_ENV
      ? process.env.NODE_ENV === 'development'
      : true
    if (!isDev)
      self.config = await EsbuildConfig.make(opts)
  }
}
