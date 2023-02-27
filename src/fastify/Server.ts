import type { FastifyInstance, FastifyRegisterOptions, FastifyReply, FastifyRequest } from 'fastify'
import type { FastifyEnvOptions } from '@fastify/env'
import fastifyEnv from '@fastify/env'
import middie from '@fastify/middie'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import { FileUtilsPromises, PathUtils } from '../utils'
import type { Endpoint } from '../types'
import { Dotenv } from './Dotenv'
import { Middleware } from './Middleware'

type Register = 'plugins' | 'routes' | 'middlewares' | 'cors'
type BeforeStart = (fastify: FastifyInstance, dotenv: Dotenv, isDev: boolean) => Promise<void>
type AfterStart = (dotenv: Dotenv) => Promise<void>

interface Options {
  beforeStart?: BeforeStart
  afterStart?: AfterStart
  register?: Register[]
}

interface MiddlewareReturn {
  endpoint: Endpoint
  condition: boolean
  abort?: boolean
  code?: 400 | 401 | 403 | 404 | 500
  message?: string
}

interface ServerStart {
  options?: Options
  /**
   * Set an base URL to protect with API key, all routes nested under this URL will be protected.
   *
   * @example
   * `/api`
   */
  apiKeyProtect?: string
  register?: (fastify: FastifyInstance) => void
  autoMiddleware?: (
    query: Record<string, string>,
    params: Record<string, string>,
    request: FastifyRequest,
    reply: FastifyReply,
  ) => MiddlewareReturn[]
  middleware?: (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => void
}

export class Server {
  protected constructor(
    protected fastify: FastifyInstance,
    protected options: FastifyRegisterOptions<FastifyEnvOptions> | undefined,
    protected isDev: boolean = false,
  ) {
  }

  public static make(): Server {
    const dotenv = Dotenv.make()

    const fastify = Fastify({
      logger: Server.logger(),
      ignoreTrailingSlash: true,
    })
    const config = new Server(fastify, {
      confKey: 'config',
      schema: dotenv.getSchema(),
      data: process.env,
      dotenv: true,
    })

    console.log('Server initialized', process.env.NODE_ENV)
    config.isDev = process.env.NODE_ENV === 'development'

    return config
  }

  public async start({
    options,
    apiKeyProtect,
    register,
    autoMiddleware,
    middleware,
  }: ServerStart = {
    options: undefined,
    apiKeyProtect: undefined,
    register: undefined,
    autoMiddleware: undefined,
    middleware: undefined,
  }) {
    if (!options)
      options = {}

    if (!options.register?.length)
      options.register = ['cors', 'middlewares', 'plugins', 'routes']

    console.log(`Current environment: ${this.isDev ? 'development' : 'production'}`)

    try {
      await this.fastify.register(fastifyEnv, this.options)
      const dotenv = Dotenv.make()

      if (options.register.includes('plugins'))
        await this.loadPlugins()

      if (options.register.includes('routes'))
        await this.loadRoutes()

      if (options.beforeStart)
        await options.beforeStart(this.fastify, dotenv, this.isDev)

      if (options.register.includes('middlewares')) {
        await this.fastify.register(middie, {
          hook: 'onRequest',
        })

        this.fastify.addHook('onRequest', async (request, reply) => {
          const instance = Middleware.make(request, reply, apiKeyProtect)

          if (instance.abort) {
            reply.type('application/json')
              .code(instance.code)
              .send(JSON.stringify({
                status: instance.code,
                message: instance.message,
              }))
          }

          if (middleware)
            middleware(request, reply)

          if (autoMiddleware) {
            const params = request.params as Record<string, string>
            const query = request.query as Record<string, string>
            const customInstance = autoMiddleware(query, params, request, reply)

            customInstance.forEach((instance) => {
              if (instance.condition && instance.abort) {
                reply.type('application/json')
                  .code(instance.code || 500)
                  .send(JSON.stringify({
                    status: instance.code,
                    message: instance.message,
                  }))
              }
            })
          }
        })
      }

      if (register)
        register(this.fastify)

      await this.fastify.after()

      if (options.register.includes('cors')) {
        await this.fastify.register(cors, {
          origin: dotenv.origin,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin'],
          credentials: true,
          maxAge: 86400,
        })
      }

      process.on('SIGTERM', async () => {
        await this.fastify.close()
      })

      await this.fastify.listen({ port: dotenv.system.PORT })

      console.warn(`Server listening on ${dotenv.system.API_URL}`)

      if (options.afterStart)
        await options.afterStart(dotenv)
    }
    catch (error) {
      console.error(`Error: ${error}`)
      this.fastify.log.error(error)
      process.exit(1)
    }
  }

  private async loadRoutes() {
    console.log('Loading routes...')

    const baseDir = `${this.isDev ? 'src' : 'build'}`
    const routePath = PathUtils.getFromRoot(`${baseDir}/routes`)
    const routeFiles = await FileUtilsPromises.readDirRecursively(routePath)

    const routes: string[] = []
    await Promise.all(routeFiles.map(async (file) => {
      file = file.replace('.ts', this.isDev ? '' : '.mjs')
      file = file.replace('_', ':')

      try {
        const route = await import(file)
        await route.default(this.fastify)
      }
      catch (e) {
        throw new Error(`Import file error: ${file}`)
      }

      routes.push(file)
    }))

    return routes
  }

  private async loadPlugins() {
    console.log('Loading plugins...')

    const baseDir = `${this.isDev ? 'src' : 'build'}`
    const pluginsPath = PathUtils.getFromRoot(`${baseDir}/plugins`)
    const pluginsFiles = await FileUtilsPromises.readDir(pluginsPath)

    const plugins: string[] = []
    await Promise.all(pluginsFiles.map(async (file) => {
      file = file.replace('.ts', this.isDev ? '' : '.mjs')
      const path = PathUtils.getFromRoot(`${baseDir}/plugins/${file}`)

      const route = await import(path)
      await route.default(this.fastify)

      plugins.push(file)
    }))

    return plugins
  }

  private static logger() {
    const config = Dotenv.make()
    const logger = process.env.NODE_ENV_LOG === 'production'
      ? { level: config.data.LOG_LEVEL }
      : {
          level: config.data.LOG_LEVEL,
          transport: {
            target: 'pino-pretty',
            options: {
              destination: 1,
              colorize: true,
              translateTime: 'HH:MM:ss.l',
              ignore: 'pid,hostname',
            },
          },
        }

    return logger
  }
}
