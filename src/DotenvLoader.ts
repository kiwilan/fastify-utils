import { fileURLToPath } from 'node:url'
import { FsFile } from '@kiwilan/filesystem'
import { Environment } from './env'

export class DotenvLoader {
  protected constructor(
    public env?: Environment,
    public envPath?: string,
  ) {}

  public static async make(): Promise<DotenvLoader> {
    const self = new DotenvLoader()

    const env = await Environment.make()

    self.env = env
    self.envPath = self.path('dotenv.ts')

    const types: string[] = []
    for (const key in self.env.typer?.types) {
      if (Object.prototype.hasOwnProperty.call(self.env.typer?.types, key)) {
        const element = self.env.typer?.types[key]
        types.push(`${key}: ${element},`)
      }
    }

    const list: string[] = []
    for (const key in self.env.dotenv) {
      if (Object.prototype.hasOwnProperty.call(self.env.dotenv, key)) {
        const element = self.env.dotenv[key]
        list.push(`${key}: '${element}',`)
      }
    }

    const content = `const dotenv: Dotenv = {
  ${list.join('\n')}
}

export default dotenv`
    await FsFile.put(self.envPath, content)

    return self
  }

  public async get(): Promise<IDotenv> {
    return import(this.envPath!)
  }

  private path(path: string): string {
    const root = fileURLToPath(new URL('.', import.meta.url))
    return `${root}${path}`
  }
}
