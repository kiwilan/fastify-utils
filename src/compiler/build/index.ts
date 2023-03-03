import { createTsConfig } from './create_ts_config'
import { esbuildConfig } from './esbuild_config'
import { generateMetadata } from './generate_metadata'
import { replaceEnums } from './replace_enums'
import { generateRoutes } from './generate_routes'
import { generateEnvironment } from './generate_dotenv'
import { generateDefinitions } from './generate_definitions'

interface Metadata {
  name: string
  version: string
  description: string
  author: string
  license: string
  type: string
  homepage: string
}
type EnvironmentTypeJson = 'string' | 'number' | 'boolean' | 'array' | 'object'
interface EnvironmentJson {
  dotenv: Record<string, EnvironmentTypeJson>
}

export type {
  Metadata,
  EnvironmentTypeJson,
  EnvironmentJson,
}

export {
  createTsConfig,
  esbuildConfig,
  generateMetadata,
  replaceEnums,
  generateRoutes,
  generateEnvironment,
  generateDefinitions,
}
