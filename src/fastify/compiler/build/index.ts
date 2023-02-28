import { createTsConfig } from './create_ts_config'
import { esbuildConfig } from './esbuild_config'
import { generateMetadata } from './generate_metadata'
import { replaceEnums } from './replace_enums'
import { generateRoutes } from './generate_routes'
import { generateDotenv } from './generate_dotenv'

interface Metadata {
  name: string
  version: string
  description: string
  author: string
  license: string
  type: string
  homepage: string
}
type DotenvTypeJson = 'string' | 'number' | 'boolean' | 'array' | 'object'
interface DotenvJson {
  dotenv: Record<string, DotenvTypeJson>
}

export type {
  Metadata,
  DotenvTypeJson,
  DotenvJson,
}

export {
  createTsConfig,
  esbuildConfig,
  generateMetadata,
  replaceEnums,
  generateRoutes,
  generateDotenv,
}
