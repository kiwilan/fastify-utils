import { FsFile, FsPath } from '@kiwilan/filesystem'

export const generateDefinitions = async (definitions: string[], routes: string[]): Promise<any> => {
  const routesFile = FsPath.root('src/routes.ts')
  const globalTypes = FsPath.root('src/global.d.ts')

  const routesList = routes.map(route => `'${route}'`).join(' | ')
  const envList = definitions.map(key => `'${key}'`).join(' | ')

  const typesContent = `declare global {
  declare namespace Route {
    export type Endpoint = ${routesList}
  }
  declare namespace Environment {
    export type Key = ${envList}
  }
}

export {};`
  await FsFile.put(globalTypes, typesContent)

  const list = routes.map((route, index) => `  '${route}' = ${index},`).join('\n')
  await FsFile.put(routesFile, `export enum EndpointEnum {\n${list}\n}\n`)
}
