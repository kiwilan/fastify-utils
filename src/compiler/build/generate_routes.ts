import { FsFile, FsPath } from '@kiwilan/filesystem'

export const generateRoutes = async (): Promise<string[]> => {
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
