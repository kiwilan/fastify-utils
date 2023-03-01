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
    const nodeEnv = process.env.NODE_ENV as NodeEnv ?? 'development'
    const isDev = nodeEnv === 'development'

    // const logLevel = this.data.LOG_LEVEL as LogLevel ?? 'debug'
    // const baseURL = this.data.BASE_URL ?? 'localhost'
    // const port = parseInt(this.data.PORT ?? '3000')
    // const https = this.data.HTTPS === 'true' ?? false
    // const apiKey = this.data.API_KEY !== ''
    //   ? this.data.API_KEY ?? ''
    //   : false

    const logLevel = process.env.LOG_LEVEL as LogLevel ?? 'debug'
    const baseURL = process.env.BASE_URL ?? 'localhost'
    const port = parseInt(process.env.PORT ?? '3000')
    const https = process.env.HTTPS === 'true' ?? false
    const apiKey = process.env.API_KEY
      ? process.env.API_KEY ?? ''
      : false

    const prefix = https ? 'https' : 'http'
    const suffix = nodeEnv === 'development' ? `:${port}` : ''

    this.system = {
      NODE_ENV: nodeEnv,
      IS_DEV: isDev,
      LOG_LEVEL: logLevel,
      BASE_URL: baseURL,
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
