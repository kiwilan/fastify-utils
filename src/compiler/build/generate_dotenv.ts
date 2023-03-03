import { FsFile, FsPath } from '@kiwilan/filesystem'
import type { EnvironmentJson } from '.'

export const generateEnvironment = async (): Promise<string[]> => {
  const path = FsPath.root('config.fastify.json')
  const isExists = await FsFile.exists(path)
  const configStart = {
    $schema: './node_modules/fastify-utils/lib/schema.json',
    dotenv: {},
  }

  if (!isExists) {
    console.warn('`config.fastify.json` not found')
    await FsFile.put(path, JSON.stringify(configStart, null, 2))
  }

  const dotenvFile = await FsFile.get(path)
  const json: EnvironmentJson = JSON.parse(dotenvFile.toString())

  const list: string[] = []

  let k: string
  for (k in json.dotenv) {
    // const v = json.dotenv[k]
    list.push(k)
  }

  return list
}
