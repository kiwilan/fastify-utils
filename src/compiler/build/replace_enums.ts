import type { ReplaceInFileBulk } from '@kiwilan/filesystem'
import { FsFile } from '@kiwilan/filesystem'
import { packagePath } from '@/src/lib/fastify/utils'

export const replaceEnums = async (definitions: string[], routes: string[]): Promise<any> => {
  const typesCache = packagePath('index.d.ts.cache')
  const jsCache = packagePath('index.js.cache')

  const haveTypesCache = await FsFile.exists(typesCache)
  const haveJsCache = await FsFile.exists(jsCache)
  if (!haveTypesCache) {
    const types = await FsFile.get(packagePath('index.d.ts'))
    await FsFile.put(typesCache, types)
  }
  if (!haveJsCache) {
    const js = await FsFile.get(packagePath('index.js'))
    await FsFile.put(jsCache, js)
  }

  const replaceTypes: ReplaceInFileBulk[] = [
    {
      from: 'SAMPLE_DOTENV = 0\n',
      to: definitions.map(el => `${el} = 0,`).join('\n'),
    },
    {
      from: 'SAMPLE_ENDPOINT = 0\n',
      to: routes.map(el => `'${el}' = 0,`).join('\n'),
    },
  ]
  await FsFile.replaceInFileBulk(typesCache, packagePath('index.d.ts'), replaceTypes)

  const replaceJs: ReplaceInFileBulk[] = [
    {
      from: 'var DotEnvEnum = /* @__PURE__ */ ((DotEnvEnum2) => {\n',
      to: `var DotEnvEnum = ((DotEnvEnum2) => {\n${definitions.map(el => `DotEnvEnum2[DotEnvEnum2["${el}"] = 0] = "${el}";`).join('\n')}`,
    },
    {
      from: 'var EndpointEnum = /* @__PURE__ */ ((EndpointEnum2) => {\n',
      to: `var EndpointEnum = ((EndpointEnum2) => {\n${routes.map(el => `EndpointEnum2[EndpointEnum2["${el}"] = 0] = "${el}";`).join('\n')}`,
    },
    {
      from: 'DotEnvEnum2[DotEnvEnum2["SAMPLE_DOTENV"] = 0] = "SAMPLE_DOTENV";',
      to: '',
    },
    {
      from: 'EndpointEnum2[EndpointEnum2["SAMPLE_ENDPOINT"] = 0] = "SAMPLE_ENDPOINT";',
      to: '',
    },
  ]
  await FsFile.replaceInFileBulk(jsCache, packagePath('index.js'), replaceJs)
}
