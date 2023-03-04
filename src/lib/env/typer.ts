import type { DotenvAny } from '../types'
import type { DotenvReader } from './reader'

export class DotenvTyper {
  protected constructor(
    protected reader: DotenvReader,
    public types: DotenvAny = {},
    public dotenvTypes: DotenvAny = {},
  ) {
  }

  public static async make(reader: DotenvReader): Promise<DotenvTyper> {
    const self = new DotenvTyper(reader)

    self.types = await self.setTypes()
    self.dotenvTypes = self.setDotenvTypes()

    return self
  }

  private setDotenvTypes(): object {
    const baseDotenv = {
      NODE_ENV: 'NodeEnv',
      IS_DEV: 'boolean',
      LOG_LEVEL: 'LogLevel',
      BASE_URL: 'string',
      HOST: 'string',
      PORT: 'number',
      HTTPS: 'boolean',
      API_URL: 'string',
      API_DOMAINS: 'string[]',
      API_DOMAINS_PARSED: 'string[]',
      API_DOMAINS_ALL: 'boolean',
      ORIGIN: 'string',
      API_KEY: 'string | false',
    }

    const currentTypes = this.types || {}
    const types = {}
    for (const key in currentTypes) {
      // @ts-expect-error - key is string
      types[key] = currentTypes[key]
    }

    for (const key in baseDotenv) {
      // @ts-expect-error - key is string
      if (!types[key]) {
        // @ts-expect-error - key is string
        types[key] = baseDotenv[key]
      }
    }

    for (const key in types) {
      // @ts-expect-error - key is string
      let cleanType = types[key]
      cleanType = cleanType.replace('\'', '').replace('"', '')
      // @ts-expect-error - key is string
      types[key] = cleanType
    }

    return types
  }

  private async setTypes(): Promise<object> {
    const types = {}

    for (const key in this.reader.dotenv) {
      const value = this.reader.dotenv[key]
      let type = this.guessType(value)
      type = this.setTypeFromConfig(key, type)
      type = this.setTypeFromStatic(key, type)

      // @ts-expect-error - key is string
      types[key] = type
    }

    return types
  }

  private setTypeFromStatic(key: string, originalType: string): string {
    const staticTypes = {
      NODE_ENV: 'NodeEnv',
      IS_DEV: 'boolean',
      LOG_LEVEL: 'LogLevel',
      BASE_URL: 'string',
      HOST: 'string',
      PORT: 'number',
      HTTPS: 'boolean',
      API_URL: 'string',
      API_DOMAINS: 'string[]',
      API_DOMAINS_PARSED: 'string[]',
      API_DOMAINS_ALL: 'boolean',
      ORIGIN: 'string',
      API_KEY: 'string | false',
    }

    // @ts-expect-error - key is string
    const type = staticTypes[key]

    if (!type)
      return originalType

    return type
  }

  private setTypeFromConfig(key: string, originalType: string): string {
    const type = this.reader.config[key]

    if (!type)
      return originalType

    return type
  }

  private guessType(value: string): string {
    if (value === 'true' || value === 'false' || value === '0' || value === '1')
      return 'boolean'

    if (value.includes(','))
      return 'string[]'

    if (this.isNumber(value))
      return 'number'

    return 'string'
  }

  private isNumber(value: string | number): boolean {
    return ((value != null)
           && (value !== '')
           && !isNaN(Number(value.toString())))
  }
}
