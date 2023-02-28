import type { Metadata } from '.'
import { FileUtilsPromises, PathUtils } from '@/src/utils'

export const generateMetadata = async (): Promise<Metadata> => {
  const path = PathUtils.getFromRoot('package.json')
  const content = await FileUtilsPromises.readFile(path)

  const contentJson: Metadata = JSON.parse(content)
  const json = {
    name: contentJson.name,
    version: contentJson.version,
    description: contentJson.description,
    author: contentJson.author,
    license: contentJson.license,
    type: contentJson.type,
    homepage: contentJson.homepage,
  }

  await FileUtilsPromises.createFile(PathUtils.getFromRoot('build/metadata.json'), JSON.stringify(json, null, 2))
  await FileUtilsPromises.createFile(PathUtils.getFromRoot('src/metadata.json'), JSON.stringify(json, null, 2))

  await FileUtilsPromises.addToGitIgnore('src/metadata.json')

  return json
}
