import type { FastifyPluginAsync, FastifyReply, FastifyRequest, HTTPMethods } from 'fastify'
import type { IRoute } from '../types'
import { Environment } from './env'

interface HttpRequest extends FastifyRequest {}
interface HttpReply extends FastifyReply {}
interface CreateRoute {
  endpoint: Route.Endpoint
  method?: HTTPMethods | HTTPMethods[]
  action?: (request: HttpRequest, reply: HttpReply) => Promise<any>
}

export class Router {
  // public static list(): string[] {
  //   const routes: string[] = []
  //   // @ts-expect-error - `EndpointEnum` is not defined
  //   Object.keys(EndpointEnum).forEach((key) => {
  //     routes.push(key)
  //   })
  //   routes.shift()

  //   return routes
  // }

  /**
   * Create route from `Endpoint`
   */
  public static setRoute(endpoint: Route.Endpoint): Route.Endpoint {
    return endpoint
  }

  /**
   * Check if current `object` is `Route`
   */
  public static isRoute(object: unknown): object is IRoute {
    return Object.prototype.hasOwnProperty.call(object, 'endpoint')
  }

  /**
   * Create an url from `Endpoint` or `Route`
   */
  public static route = async (route: Route.Endpoint | IRoute, params?: {
    [key: string]: string | number | undefined
  }): Promise<string> => {
    let current: IRoute = { endpoint: 'SAMPLE_ENDPOINT' }

    if (!Router.isRoute(route))
      current = { endpoint: route }
    else
      current = route

    const env = await Environment.make()

    let currentRoute: string = current.endpoint

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key]
        if (value)
          currentRoute = currentRoute.replace(`:${key}`, value.toString())
      })
    }

    try {
      const url = new URL(currentRoute, env.system.API_URL)

      if (current.query) {
        Object.keys(current.query).forEach((key) => {
          if (current.query)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
            url.searchParams.append(key, current.query[key])
        })
      }

      return url.toString()
    }
    catch (error) {
      console.error(error)

      return 'error'
    }
  }

  /**
   * Create a `Route` from `Request`
   */
  public static routeBuilder = async (req: FastifyRequest): Promise<IRoute> => {
    const dotenv = await Environment.make()
    const baseURL = dotenv.data.BASE_URL || ''
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const url = req.url.replace(baseURL, '').replace(/\/$/, '')
    const route: IRoute = { endpoint: 'SAMPLE_ENDPOINT' }

    // const splitted = url.split('?')
    // if (splitted.length === 1) {
    //   route = { endpoint: splitted[0] as Endpoint }
    //   return route
    // }

    // route.endpoint = splitted[0] as Endpoint

    // // get query params
    // const query = splitted[1]
    // const params = new URLSearchParams(query)
    // const queryObject = {}
    // params.forEach((value, key) => {
    //   if (queryObject) {
    //     queryObject[key] = value
    //   }
    // })
    // route.query = queryObject as RouteQuery

    return route
  }

  public static newRoute(route: CreateRoute): FastifyPluginAsync {
    const createdRoute: FastifyPluginAsync = async (fastify): Promise<void> => {
      fastify.route({
        method: route.method || 'GET',
        url: Router.setRoute(route.endpoint),
        async handler(request, reply) {
          if (route.action)
            return await route.action(request, reply)

          return {
            ready: true,
          }
        },
      })
    }

    return createdRoute
  }
}
