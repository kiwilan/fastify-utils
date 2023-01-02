import { join } from 'path'
import type { FastifyInstance, FastifyRegisterOptions } from 'fastify'
import type { FastifyEnvOptions } from '@fastify/env'
import fastifyEnv from '@fastify/env'
import { fastifyAutoload } from '@fastify/autoload'
import middie from '@fastify/middie'
import cors from '@fastify/cors'
import Dotenv from './Dotenv'
import Middleware from './Middleware'

type Register = 'plugins' | 'routes' | 'middlewares' | 'cors'
type Callback = (dotenv: Dotenv) => Promise<void>

export default class Configuration {
  protected constructor(
    protected options: FastifyRegisterOptions<FastifyEnvOptions> | undefined,
  ) {
  }

  public static make(): Configuration {
    const dotenv = Dotenv.make()

    const config = new Configuration({
      confKey: 'config',
      schema: dotenv.getSchema(),
      data: process.env,
      dotenv: true,
    })

    return config
  }

  public async start(fastify: FastifyInstance, callback?: Callback, register: Register[] = ['cors', 'middlewares', 'plugins', 'routes']) {
    try {
      await fastify.register(fastifyEnv, this.options)

      if (register.includes('plugins')) {
        await fastify.register(fastifyAutoload, {
          dir: join(__dirname, 'plugins'),
        })
      }

      if (register.includes('routes')) {
        await fastify.register(fastifyAutoload, {
          dir: join(__dirname, 'routes'),
        })
      }

      if (register.includes('middlewares')) {
        await fastify.register(middie, {
          hook: 'onRequest',
        })

        fastify.addHook('onRequest', async (request, reply) => {
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

      await fastify.after()

      const dotenv = Dotenv.make()

      if (register.includes('cors')) {
        await fastify.register(cors, {
          origin: dotenv.origin,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin'],
          credentials: true,
          maxAge: 86400,
        })
      }

      await fastify.listen({ port: dotenv.system.PORT })

      console.warn(`Server listening on ${dotenv.system.API_URL}`)

      if (callback)
        await callback(dotenv)
    }
    catch (error) {
      fastify.log.error(error)
      process.exit(1)
    }
  }

  public logger() {
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
