import { join } from 'path'
import { statSync } from 'fs'
import type { FastifyInstance, FastifyRegisterOptions } from 'fastify'
import type { FastifyEnvOptions } from '@fastify/env'
import fastifyEnv from '@fastify/env'
import { fastifyAutoload } from '@fastify/autoload'
import middie from '@fastify/middie'
import cors from '@fastify/cors'
import Fastify from 'fastify'
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

export default class Configuration {
  protected constructor(
    protected fastify: FastifyInstance,
    protected options: FastifyRegisterOptions<FastifyEnvOptions> | undefined,
  ) {
  }

  public static make(): Configuration {
    const dotenv = Dotenv.make()

    const fastify = Fastify({
      logger: Configuration.logger(),
      ignoreTrailingSlash: true,
    })
    const config = new Configuration(fastify, {
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

    try {
      await this.fastify.register(fastifyEnv, this.options)
      const dotenv = Dotenv.make()

      if (options.beforeStart)
        await options.beforeStart(this.fastify, dotenv)

      if (options.register.includes('plugins') && this.checkDirExists('plugins')) {
        await this.fastify.register(fastifyAutoload, {
          dir: join(__dirname, 'plugins'),
        })
      }

      if (options.register.includes('routes') && this.checkDirExists('routes')) {
        await this.fastify.register(fastifyAutoload, {
          dir: join(__dirname, 'routes'),
        })
      }

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
      this.fastify.log.error(error)
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

  private checkDirExists(dir: string): boolean {
    try {
      return statSync(dir).isDirectory()
    }
    catch (error) {
      console.warn(`Directory ${dir} does not exist`)
      return false
    }
  }
}
