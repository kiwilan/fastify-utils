import { FsFile, FsPath } from '@kiwilan/filesystem'

export class GenerateRoutes {
  public static async make(): Promise<string[]> {
    const self = new GenerateRoutes()
    const routes = await self.generate()
    await self.print(routes)

    return routes
  }

  private async generate(): Promise<string[]> {
    const routesPath = FsPath.root('src/routes')
    const isExists = await FsFile.exists(routesPath)

    if (!isExists) {
      console.warn('`src/routes` not found')
      return []
    }

    const routesList: string[] = []
    const files = await FsFile.allFilesGlob({
      directory: routesPath,
      extensions: ['ts'],
    })

    files.forEach((file) => {
      let path = file.path
      path = path.replace('.ts', '')
      const splitted = path.split('routes/')
      let pathRaw = splitted[1]
      pathRaw = pathRaw.replace('index', '/')
      pathRaw = pathRaw.replace('//', '/')

      if (pathRaw.length !== 1) {
        pathRaw = pathRaw.endsWith('/')
          ? pathRaw.slice(0, -1)
          : pathRaw
      }

      if (!pathRaw.startsWith('/'))
        pathRaw = `/${pathRaw}`

      pathRaw = pathRaw.replace('[', ':')
      pathRaw = pathRaw.replace(']', '')

      const routePath = pathRaw

      routesList.push(routePath)
    })

    return routesList.map(el => el)
  }

  private async print(routes: string[]): Promise<void> {
    const routesFile = FsPath.root('src/routes.ts')
    const globalTypes = FsPath.root('src/global.d.ts')

    const routesList = routes.map(route => `'${route}'`).join(' | ')

    const typesContent = `declare global {
  declare namespace Route {
    export type Endpoint = ${routesList}
  }
}

export {};`
    await FsFile.put(globalTypes, typesContent)

    const list = routes.map((route, index) => `  '${route}' = ${index},`).join('\n')
    await FsFile.put(routesFile, `export enum EndpointEnum {\n${list}\n}\n`)
  }
}
