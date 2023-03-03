import { FsFile, FsPath } from '@kiwilan/filesystem'
import type { Metadata } from '.'

export const generateMetadata = async (): Promise<Metadata> => {
  const path = FsPath.root('package.json')
  const content = await FsFile.get(path)

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

  await FsFile.put(FsPath.root('build/metadata.json'), JSON.stringify(json, null, 2))
  await FsFile.put(FsPath.root('src/metadata.json'), JSON.stringify(json, null, 2))

  await FsFile.addToGitIgnore('src/metadata.json')

  return json
}
