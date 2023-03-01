import type { LogLevel } from 'fastify'
import { environmentProperties } from './environment_properties'
import { environmentData } from './environment_data'
import { corsDomains } from './cors_domains'
import type { EnvironmentConfig, EnvironmentSystemConfig, ISchema, NodeEnv } from '@/src/types'
import { EnvironmentEnum } from '@/src/types'

export class Environment {
  protected constructor(
    public properties: string[],
    public data: EnvironmentConfig,
    public system: EnvironmentSystemConfig,
    public origin: string | string[] = '*',
  ) {
  }

  public static make(): Environment {
    const self = new Environment([], {}, {
      NODE_ENV: 'development',
      IS_DEV: true,
      LOG_LEVEL: 'debug',
      BASE_URL: 'localhost',
      HOST: 'localhost',
      PORT: 3000,
      API_URL: 'http://localhost:3000',
      API_DOMAINS: [],
      API_DOMAINS_PARSED: [],
      API_DOMAINS_ALL: false,
      API_KEY: false,
    })

    self.properties = environmentProperties().generate()
    self.data = environmentData()
    self.parseEnv()

    return self
  }

  private parseEnv(): void {
    const nodeEnv = process.env.NODE_ENV
      ? process.env.NODE_ENV as NodeEnv ?? 'development'
      : this.data.NODE_ENV as NodeEnv ?? 'development'
    const isDev = nodeEnv === 'development'

    const logLevel = process.env.LOG_LEVEL
      ? process.env.LOG_LEVEL as LogLevel
      : this.data.LOG_LEVEL as LogLevel
    const baseURL = process.env.BASE_URL
      ? process.env.BASE_URL
      : this.data.BASE_URL ?? 'localhost'
    const host = process.env.HOST
      ? process.env.HOST
      : this.data.HOST ?? 'localhost'
    const port = process.env.PORT
      ? parseInt(process.env.PORT ?? '3000')
      : parseInt(this.data.PORT ?? '3000')
    const https = process.env.HTTPS
      ? process.env.HTTPS === 'true'
      : this.data.HTTPS === 'true' ?? false

    let apiKey: string | false = false
    if (process.env.API_KEY) {
      apiKey = process.env.API_KEY !== ''
        ? process.env.API_KEY
        : false
    }
    if (!process.env.API_KEY) {
      apiKey = this.data.API_KEY !== undefined
        ? this.data.API_KEY
        : false
    }

    const prefix = https ? 'https' : 'http'
    const suffix = nodeEnv === 'development' ? `:${port}` : ''

    this.system = {
      NODE_ENV: nodeEnv,
      IS_DEV: isDev,
      LOG_LEVEL: logLevel,
      BASE_URL: baseURL,
      HOST: host,
      PORT: port,
      API_URL: `${prefix}://${baseURL}${suffix}`,
      API_KEY: apiKey,
      API_DOMAINS: corsDomains().fromEnvironment(),
      API_DOMAINS_PARSED: corsDomains().parsed(),
      API_DOMAINS_ALL: false,
    }

    this.system.API_DOMAINS_ALL = this.system.API_DOMAINS_PARSED.includes('*')

    this.origin = this.system.API_DOMAINS_ALL ? '*' : this.system.API_DOMAINS_PARSED
  }

  public getSchema(): ISchema {
    const required = environmentProperties().generate()
    const properties = {}
    required.forEach((element) => {
      const type = EnvironmentEnum[element as keyof typeof EnvironmentEnum]
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      properties[element] = {
        type: 'string',
        default: type,
      }
    })

    return {
      type: 'object',
      required: required as never[],
      properties,
    }
  }
}
