export type NodeEnv = 'development' | 'production'
export type LogLevel = 'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn' | 'silent'
interface EnvironmentConfigBase {
  NODE_ENV?: string
  LOG_LEVEL?: string
  BASE_URL?: string
  PORT?: string
  HTTPS?: string
  API_KEY?: string
}

export enum EnvironmentEnum {
  SAMPLE_Environment = 0,
}
export type EnvironmentType = keyof typeof EnvironmentEnum
export type IEnvironmentExtends<T> = Partial<Record<EnvironmentType, T>>
export interface EnvironmentConfig<T = string> extends IEnvironmentExtends<T>, EnvironmentConfigBase {}

export interface EnvironmentSystemConfig {
  NODE_ENV: NodeEnv
  IS_DEV: boolean
  LOG_LEVEL: LogLevel
  BASE_URL: string
  PORT: number
  API_URL: string
  API_DOMAINS: string[]
  API_DOMAINS_PARSED: string[]
  API_DOMAINS_ALL: boolean
  API_KEY: string | false
}

export interface ISchema {
  type: 'object'
  required: never[]
  properties: {
    [key: string]: string
  }
}
