import type { ReplaceInFileBulk } from '@/src/types'
import { FileUtils, FileUtilsPromises, PathUtils } from '@/src/utils'

export const replaceEnums = async (definitions: string[], routes: string[]): Promise<any> => {
  const typesCache = PathUtils.getFromPackage('index.d.ts.cache')
  const jsCache = PathUtils.getFromPackage('index.js.cache')

  const haveTypesCache = await FileUtilsPromises.checkIfFileExists(typesCache)
  const haveJsCache = await FileUtilsPromises.checkIfFileExists(jsCache)
  if (!haveTypesCache) {
    const types = await FileUtilsPromises.readFile(PathUtils.getFromPackage('index.d.ts'))
    FileUtils.createFile(typesCache, types)
  }
  if (!haveJsCache) {
    const js = await FileUtilsPromises.readFile(PathUtils.getFromPackage('index.js'))
    FileUtils.createFile(jsCache, js)
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
  FileUtils.replaceInFileBulk(typesCache, PathUtils.getFromPackage('index.d.ts'), replaceTypes)

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
  FileUtils.replaceInFileBulk(jsCache, PathUtils.getFromPackage('index.js'), replaceJs)
}
