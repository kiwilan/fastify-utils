import type { DotenvAny, DotenvDefault, DotenvExtends } from '../types'
import { DotenvDomains } from './domains'
import type { DotenvReader } from './reader'
import type { DotenvTyper } from './typer'

export class DotenvData {
  protected constructor(
    protected reader: DotenvReader,
    protected typer: DotenvTyper,
    protected valuesByDefault?: DotenvDefault,
    public values?: DotenvExtends,
  ) {
  }

  public static async make(reader: DotenvReader, typer: DotenvTyper): Promise<DotenvData> {
    const self = new DotenvData(reader, typer)

    self.valuesByDefault = {
      NODE_ENV: 'development',
      IS_DEV: true,
      LOG_LEVEL: 'debug',
      BASE_URL: 'localhost',
      HOST: 'localhost',
      PORT: 3000,
      API_DOMAINS: [],
      API_DOMAINS_PARSED: [],
      API_DOMAINS_ALL: false,
      API_KEY: false,
      API_URL: undefined,
      HTTPS: false,
      ORIGIN: '*',
      CLUSTER: false,
    }

    self.values = await self.setValues()
    self.values = self.formatValues()
    self.setValuesByDefault()
    if (self.values.BASE_URL === '/')
      self.values.BASE_URL = 'localhost'

    self.values.API_URL = self.formatUrl()
    self.values.IS_DEV = self.values.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

    const domains = await DotenvDomains.make(self.values)
    self.values.API_DOMAINS_PARSED = domains.domains
    self.values.API_DOMAINS_ALL = domains.allAllowed
    self.values.ORIGIN = domains.origin

    return self
  }

  private async setValues(): Promise<object> {
    const types = this.typer.dotenvTypes

    const values = {}

    for (const key in types) {
      // eslint-disable-next-line no-undef-init
      let value = undefined

      value = await this.parseReader(key)

      // @ts-expect-error - key is string
      values[key] = value
    }

    return values
  }

  private async parseReader(key: string): Promise<string | undefined> {
    if (process.env[key] !== undefined)
      return process.env[key]

    if (this.reader?.dotenv[key] !== undefined)
      return this.reader?.dotenv[key]
  }

  private formatValues(): object {
    const types = this.typer.dotenvTypes

    const values: DotenvAny = {}

    for (const key in this.values) {
      // eslint-disable-next-line no-undef-init
      let value = undefined

      const k = types[key]
      value = this.values[key]

      if (k === 'boolean')
        value = value === 'true'

      if (k === 'number')
        value = parseInt(value)

      if (k === 'string[]' && value)
        value = value.split(',')

      if (k === 'string | false')
        value = value === 'false' ? false : value

      values[key] = value
    }

    return values
  }

  private setValuesByDefault(): void {
    for (const key in this.valuesByDefault) {
      // @ts-expect-error - key is string
      if (this.values[key] === undefined) {
        // @ts-expect-error - key is string
        delete this.values[key]
        // @ts-expect-error - key is string
        this.values[key] = this.valuesByDefault[key]
      }
    }
  }

  private formatUrl(): string {
    if (this.values?.API_URL !== undefined)
      return this.values.API_URL

    const https = this.values?.HTTPS ?? false
    const nodeEnv = this.values?.NODE_ENV
    const port = this.values?.PORT
    const baseURL = this.values?.BASE_URL

    const isDev = nodeEnv === 'development'

    const scheme = https ? 'https' : 'http'
    const suffix = isDev ? `:${port}` : ''

    return `${scheme}://${baseURL}${suffix}`
  }
}
