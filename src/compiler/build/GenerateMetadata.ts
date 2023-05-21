import { FsFile, FsPath } from '@kiwilan/filesystem'

export interface Metadata {
  name: string
  version: string
  description: string
  author: string
  license: string
  type: string
  homepage: string
}

export class GenerateMetadata {
  public static async make(): Promise<Metadata> {
    const self = new GenerateMetadata()
    const content = await self.generate()
    await self.print(content)

    return content as unknown as Metadata
  }

  private async generate(): Promise<string> {
    const path = FsPath.root('package.json')
    const content = await FsFile.get(path)

    return content
  }

  private async print(content: string): Promise<void> {
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
  }
}
