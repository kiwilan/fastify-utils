import type { EnvironmentJson } from '.'
import { FileUtilsPromises, PathUtils } from '@/src/utils'

export const generateEnvironment = async (): Promise<string[]> => {
  const path = PathUtils.getFromRoot('config.fastify.json')
  const isExists = await FileUtilsPromises.checkIfFileExists(path)
  const configStart = {
    $schema: './node_modules/fastify-utils/lib/schema.json',
    dotenv: {},
  }

  if (!isExists) {
    console.warn('`config.fastify.json` not found')
    await FileUtilsPromises.createFile(path, JSON.stringify(configStart, null, 2))
  }

  const dotenvFile = await FileUtilsPromises.readFile(path)
  const json: EnvironmentJson = JSON.parse(dotenvFile.toString())

  const list: string[] = []

  let k: string
  for (k in json.dotenv) {
    // const v = json.dotenv[k]
    list.push(k)
  }

  return list
}
