import fs from 'fs'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import type { DotenvConfig, DotenvSystemConfig, LogLevel, NodeEnv } from '../types/dotenv'
import { DotEnvEnum } from '../types/dotenv'

interface ISchema {
  type: 'object'
  required: never[]
  properties: {
    [key: string]: string
  }
}

export default class Dotenv {
  protected constructor(
    public definition: string[],
    public properties: string[],
    public data: DotenvConfig,
    public system: DotenvSystemConfig,
    public origin: string | string[] = '*',
  ) {
  }

  public static make(): Dotenv {
    const definition = Dotenv.getDefinition()
    const properties = Dotenv.setProperties()
    const data = Dotenv.setData()

    const nodeEnv = data.NODE_ENV as NodeEnv ?? 'development'
    const logLevel = data.LOG_LEVEL as LogLevel ?? 'debug'
    const baseURL = data.BASE_URL ?? 'localhost'
    const port = parseInt(data.PORT ?? '3000')

    const system: DotenvSystemConfig = {
      NODE_ENV: nodeEnv,
      LOG_LEVEL: logLevel,
      BASE_URL: baseURL,
      PORT: port,
      API_URL: `http://${baseURL}:${port}`,
      API_DOMAINS: [],
      API_DOMAINS_PARSED: [],
      API_DOMAINS_ALL: false,
    }
    const dotenv = new Dotenv(definition, properties, data, system)

    system.API_DOMAINS = dotenv.domainsDotenv()
    system.API_DOMAINS_PARSED = dotenv.domainsParsed()
    system.API_DOMAINS_ALL = system.API_DOMAINS_PARSED.includes('*')

    dotenv.origin = system.API_DOMAINS_ALL ? '*' : system.API_DOMAINS_PARSED

    return dotenv
  }

  private static getDefinition(): string[] {
    const root = process.cwd()
    const file = join(root, 'src/dotenv')

    if (!fs.existsSync(file))
      throw new Error('File dotenv not found')

    let raw = fs.readFileSync(file).toString().split('\n')
    raw = raw.filter(el => el)

    const type = join(__dirname, 'index.d.ts')
    const dotenvList = raw.map(el => `${el} = 0,`).join('\n')
    Dotenv.replaceInFile(
      type,
      'SAMPLE_DOTENV = 0',
      dotenvList,
    )

    return raw
  }

  private static async replaceInFile(path: string, str: string, replace: string) {
    try {
      const data = await readFile(path, 'utf8')
      const result = data.replace(str, replace)
      await writeFile(path, result, 'utf8')
    }
    catch (error) {
      console.warn(error)
      throw new Error('replaceInFile error')
    }
  }

  private static async checkIfContainsAsync(path: string, str: string): Promise<boolean> {
    try {
      const contents = await readFile(path, 'utf-8')
      const result = contents.includes(str)

      return result
    }
    catch (err) {
      console.warn(err)
      throw new Error('checkIfContainsAsync error')
    }
  }

  private static setProperties(): string[] {
    const properties: string[] = []
    Object.keys(DotEnvEnum).forEach((element) => {
      if (isNaN(parseInt(element)))
        properties.push(element)
    })

    return properties
  }

  private static setData(): DotenvConfig {
    const path = join(process.cwd(), '.env')
    const raw = fs.readFileSync(path).toString().split('\n')

    const config: DotenvConfig = {}
    raw.forEach((el) => {
      if (el) {
        const split = el.split('=')
        const key = split[0] as keyof DotenvConfig | string
        let value = split[1] || undefined

        if (!Object.keys(DotEnvEnum).includes(key))
          return

        if (value?.includes('#'))
          value = value.split('#')[0].trim()

        if (key?.startsWith('#'))
          value = undefined

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        config[key] = value
      }
    })

    let k: keyof DotenvConfig
    for (k in config) {
      const v = config[k]
      if (v === undefined)
        config[k] = Dotenv.defaultProperties()[k]
    }

    this.setDefaultProperties(config)

    return config
  }

  public getSchema(): ISchema {
    const required = Dotenv.setProperties()
    const properties = {}
    required.forEach((element) => {
      const type = DotEnvEnum[element as keyof typeof DotEnvEnum]
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

  private static defaultProperties(): DotenvConfig {
    return {
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      PORT: '3000',
      BASE_URL: 'localhost',
    }
  }

  private static setDefaultProperties(config: DotenvConfig): void {
    const properties = Dotenv.defaultProperties()
    Object.keys(properties).forEach((element) => {
      if (!config[element as keyof DotenvConfig])
        config[element as keyof DotenvConfig] = properties[element as keyof DotenvConfig]
    })
  }

  private domainsDotenv(): string[] {
    let domains: string[] = []
    if (process.env.API_DOMAINS)
      domains = process.env.API_DOMAINS?.split(',')

    return domains
  }

  private domainsParsed(): string[] {
    const dotenvDomains = this.domainsDotenv()
    const domains: string[] = []
    let allow = false

    if (dotenvDomains && dotenvDomains[0] === '*')
      allow = true

    if (allow) {
      domains.push('*')
    }
    else {
      dotenvDomains.forEach((domain) => {
        if (domain.startsWith('*')) {
          const domainParsed = domain.replace('*.', '')
          domains.push(`http://${domainParsed}`)
          domains.push(`https://${domainParsed}`)
        }

        if (domain.includes('localhost')) {
          const localhostIP = domain.replace('localhost', '127.0.0.1')
          domains.push(`http://${localhostIP}`)
          domains.push(`https://${localhostIP}`)
        }

        domains.push(`http://${domain}`)
        domains.push(`https://${domain}`)
      })
    }

    return domains
  }
}
