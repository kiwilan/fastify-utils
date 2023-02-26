import type { FastifyInstance, FastifyRegisterOptions } from 'fastify'
import type { FastifyEnvOptions } from '@fastify/env'
import fastifyEnv from '@fastify/env'
import middie from '@fastify/middie'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import { FileUtilsPromises, PathUtils } from '../utils'
import { Dotenv } from './Dotenv'
import { Middleware } from './Middleware'

type Register = 'plugins' | 'routes' | 'middlewares' | 'cors'
type BeforeStart = (fastify: FastifyInstance, dotenv: Dotenv, isDev: boolean) => Promise<void>
type AfterStart = (dotenv: Dotenv, isDev: boolean) => Promise<void>

interface Options {
  beforeStart?: BeforeStart
  afterStart?: AfterStart
  register?: Register[]
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

    config.isDev = dotenv.system.NODE_ENV === 'development'

    return config
  }

  public async start(options: Options = {}) {
    if (!options.register?.length)
      options.register = ['cors', 'middlewares', 'plugins', 'routes']

    console.log(`Current environment: ${this.isDev ? 'development' : 'production'}`)

    try {
      await this.fastify.register(fastifyEnv, this.options)
      const dotenv = Dotenv.make()

      if (options.register.includes('plugins'))
        await this.load('plugins')

      if (options.register.includes('routes'))
        await this.load('routes')

      if (options.beforeStart)
        await options.beforeStart(this.fastify, dotenv, this.isDev)

      if (options.register.includes('middlewares')) {
        await this.fastify.register(middie, {
          hook: 'onRequest',
        })

        this.fastify.addHook('onRequest', async (request, reply) => {
          const instance = Middleware.make(request, reply)

          if (instance.abort) {
            reply.type('application/json')
              .code(instance.code)
              .send(JSON.stringify({
                status: instance.code,
                message: instance.message,
              }))
          }
        })
      }

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
        await options.afterStart(dotenv, this.isDev)
    }
    catch (error) {
      console.error(`Error: ${error}`)
      this.fastify.log.error(error)
      process.exit(1)
    }
  }

  private async load(type: 'plugins' | 'routes') {
    console.log(`Loading ${type}...`)

    const baseDir = `${this.isDev ? 'src' : 'build'}`
    const routePath = PathUtils.getFromRoot(`${baseDir}/${type}`)
    const routeFiles = await FileUtilsPromises.readDir(routePath)

    const routes: any[] = []
    await Promise.all(routeFiles.map(async (file) => {
      file = file.replace('.ts', this.isDev ? '' : '.mjs')
      const path = PathUtils.getFromRoot(`${baseDir}/${type}/${file}`)

      const route = await import(path)
      await route.default(this.fastify)

      routes.push(file)
    }))

    return routes
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
