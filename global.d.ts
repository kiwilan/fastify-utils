export {}

type NodeEnv = 'development' | 'production'
type LogLevel = 'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn' | 'silent'

interface Dotenv {
  NODE_ENV: NodeEnv
  IS_DEV: boolean
  LOG_LEVEL: LogLevel
  BASE_URL: string
  HOST: string
  PORT: number
  HTTPS: boolean
  API_URL: string
  API_DOMAINS: string[]
  API_DOMAINS_PARSED: string[]
  API_DOMAINS_ALL: boolean
  ORIGIN: string
  API_KEY: string | false
  CLUSTER: boolean
}

declare global {
  interface IDotenv extends Dotenv {}
  var dotenv: Dotenv
}
