export type NodeEnv = 'development' | 'test' | 'production'
export type LogLevel = 'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn' | 'silent'
interface DotEnvConfigBase {
  NODE_ENV?: string
  LOG_LEVEL?: string
  BASE_URL?: string
  PORT?: string
}

export enum DotEnvEnum {
  SAMPLE_DOTENV = 0,
}
export type DotEnvType = keyof typeof DotEnvEnum
export type IDotEnvExtends<T> = Partial<Record<DotEnvType, T>>
export interface DotenvConfig<T = string> extends IDotEnvExtends<T>, DotEnvConfigBase {}

export interface DotenvSystemConfig {
  NODE_ENV: NodeEnv
  LOG_LEVEL: LogLevel
  BASE_URL: string
  PORT: number
  API_URL: string
  API_DOMAINS: string[]
  API_DOMAINS_PARSED: string[]
  API_DOMAINS_ALL: boolean
}
