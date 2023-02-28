import { FileUtilsPromises, PathUtils } from '@/src/utils'

export const generateRoutes = async (): Promise<string[]> => {
  const routesRaw = PathUtils.getFromRoot('src/routes')
  const isExists = await FileUtilsPromises.checkIfDirExists(routesRaw)

  if (!isExists) {
    console.warn('`src/routes` not found')
    return []
  }

  const routesList: { name: string; route: string }[] = []
  const files = await FileUtilsPromises.readDirRecursively(routesRaw, ['.ts'])

  files.forEach((element) => {
    element = element.replace('.ts', '')
    const splitted = element.split('routes/')
    let routeRaw = splitted[1]

    routeRaw = routeRaw.replace('index', '/')
    routeRaw = routeRaw.replace('//', '/')

    if (routeRaw.length !== 1) {
      routeRaw = routeRaw.endsWith('/')
        ? routeRaw.slice(0, -1)
        : routeRaw
    }

    if (!routeRaw.startsWith('/'))
      routeRaw = `/${routeRaw}`

    routeRaw = routeRaw.replace('[', ':')
    routeRaw = routeRaw.replace(']', '')

    const name = routeRaw
    const path = routeRaw

    const route = {
      name,
      route: path,
    }

    routesList.push(route)
  })

  return routesList.map(el => el.route)
}
