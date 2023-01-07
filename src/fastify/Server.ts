import type { FastifyInstance, FastifyRegisterOptions } from 'fastify'
import type { FastifyEnvOptions } from '@fastify/env'
import fastifyEnv from '@fastify/env'
import { fastifyAutoload } from '@fastify/autoload'
import middie from '@fastify/middie'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import { FileUtils } from '../utils'
import PathUtils from '../utils/PathUtils'
import Dotenv from './Dotenv'
import Middleware from './Middleware'

type Register = 'plugins' | 'routes' | 'middlewares' | 'cors'
type BeforeStart = (fastify: FastifyInstance, dotenv: Dotenv) => Promise<void>
type AfterStart = (dotenv: Dotenv) => Promise<void>

interface Options {
  beforeStart?: BeforeStart
  afterStart?: AfterStart
  register?: Register[]
}

export default class Server {
  protected constructor(
    protected fastify: FastifyInstance,
    protected options: FastifyRegisterOptions<FastifyEnvOptions> | undefined,
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

    return config
  }

  public async start(options: Options = {}) {
    if (!options.register?.length)
      options.register = ['cors', 'middlewares', 'plugins', 'routes']

    const pluginsDir = PathUtils.getFromRoot('src/plugins')
    const routesDir = PathUtils.getFromRoot('src/routes')

    try {
      await this.fastify.register(fastifyEnv, this.options)
      const dotenv = Dotenv.make()

      if (options.beforeStart)
        await options.beforeStart(this.fastify, dotenv)

      // if (options.register.includes('plugins') && FileUtils.checkDirExists(pluginsDir)) {
      //   await this.fastify.register(fastifyAutoload, {
      //     dir: pluginsDir,
      //   })
      // }

      // if (options.register.includes('routes') && FileUtils.checkDirExists(routesDir)) {
      //   await this.fastify.register(fastifyAutoload, {
      //     dir: routesDir,
      //   })
      // }

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

      await this.fastify.listen({ port: dotenv.system.PORT })

      console.warn(`Server listening on ${dotenv.system.API_URL}`)

      if (options.afterStart)
        await options.afterStart(dotenv)
    }
    catch (error) {
      console.error(`Error: ${error}`)
      process.exit(1)
    }
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
