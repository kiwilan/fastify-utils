import { FsFile, FsPath } from '@kiwilan/filesystem'
import type { DotenvAny } from '../types'

export class DotenvReader {
  protected constructor(
    public dotenv: DotenvAny = {},
    public config: DotenvAny = {},
  ) {
  }

  public static async make(): Promise<DotenvReader> {
    const self = new DotenvReader()

    self.dotenv = await self.dotenvFile()
    self.config = await self.dotenvConfig()

    return self
  }

  private async dotenvFile(): Promise<object> {
    const path = FsPath.root('.env')
    const exists = await FsFile.exists(path)

    if (!exists)
      return {}

    const content = await FsFile.get(path)
    const lines = content.split('\n')

    const dotenv = {} // EnvironmentConfig
    lines.forEach((line) => {
      if (!line)
        return

      let [key, value] = line.split('=')

      if (value?.includes('#'))
        value = value.split('#')[0].trim()

      if (key?.startsWith('#'))
        return

      if (key?.includes(' '))
        return

      // set to process.env
      if (process.env[key] === undefined)
        process.env[key] = value

      // set to config
      // @ts-expect-error - key is string
      dotenv[key] = value
    })

    return dotenv
  }

  private async dotenvConfig(): Promise<object> {
    const path = FsPath.root('config.fastify.json')
    const exists = await FsFile.exists(path)

    const list = {}

    if (!exists) {
      console.warn('`config.fastify.json` not found')
      return list
    }

    const content = await FsFile.get(path)
    const json = JSON.parse(content.toString()) // EnvironmentJson

    let k: string
    for (k in json.dotenv) {
      // @ts-expect-error - k is string
      list[k] = json.dotenv[k]
    }

    return list
  }
}
