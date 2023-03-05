import { FsFile, FsPath } from '@kiwilan/filesystem'
import type { DotenvExtends } from '../types'
import { DotenvReader } from './reader'
import { DotenvTyper } from './typer'
import { DotenvData } from './data'

export class Environment {
  protected constructor(
    public reader?: DotenvReader,
    public typer?: DotenvTyper,
    public data?: DotenvData,
    public dotenv?: DotenvExtends,
  ) {
  }

  public static async make(printing = false): Promise<Environment> {
    const self = new Environment()

    process.env.NODE_ENV = process.env.NODE_ENV || 'development'

    self.reader = await self.setReader()
    self.typer = await DotenvTyper.make(self.reader)
    self.data = await self.setData()
    if (printing)
      await self.printTypes()

    self.dotenv = self.data?.values || {}

    return self
  }

  private async setData(): Promise<DotenvData> {
    if (!this.reader && !this.typer)
      throw new Error('Reader and typer are not set')

    return await DotenvData.make(this.reader!, this.typer!)
  }

  private async setReader(): Promise<DotenvReader> {
    return await DotenvReader.make()
  }

  private async printTypes(): Promise<void> {
    const types = this.typer?.dotenvTypes || {}
    const typesList = []

    for (const key in types) {
      const type = types[key]
      typesList.push(`  ${key}: ${type},`)
    }

    const list = typesList.join('\n')

    const content = `export {}

type NodeEnv = 'development' | 'production'
type LogLevel = 'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn' | 'silent'

interface Dotenv {
${list}
}

declare global {
  interface IDotenv extends Dotenv {}
  var dotenv: Dotenv
}
`

    const path = FsPath.root('src/dotenv.d.ts')
    await FsFile.put(path, content)
  }
}
