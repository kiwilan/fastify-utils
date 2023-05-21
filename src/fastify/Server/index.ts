import type { FastifyInstance, FastifyRegisterOptions } from 'fastify'
import type { FastifyEnvOptions } from '@fastify/env'
import Fastify from 'fastify'
import { Environment } from '../../env'
import { serverLogger } from './logger'
import { ServerStart } from './ServerStart'
import type { ServerStartOptions } from '@/src/types'

interface ISchema {
  type: 'object'
  required: string[]
  properties: {
    [key: string]: string
  }
}

export class Server {
  protected constructor(
    public fastify: FastifyInstance,
    public options: FastifyRegisterOptions<FastifyEnvOptions> | undefined,
    public isDev: boolean = false,
  ) {
  }

  public static async run(opts: ServerStartOptions): Promise<Server> {
    const env = await Environment.make()
    // @ts-expect-error - globalThis is global
    globalThis.dotenv = env.dotenv

    const fastify = Fastify({
      logger: await serverLogger(),
      ignoreTrailingSlash: true,
    })

    const self = new Server(fastify, {
      confKey: 'config',
      schema: this.setFastifySchema(),
      data: process.env,
      dotenv: true,
    })

    console.debug('Server initialized', process.env.NODE_ENV)
    self.isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

    await ServerStart.make(self, opts)

    return self
  }

  private static setFastifySchema(): ISchema {
    const dotenv = globalThis.dotenv
    const required: string[] = []
    const properties: {
      [key: string]: string
    } = {}

    for (const key in dotenv) {
      if (Object.prototype.hasOwnProperty.call(dotenv, key)) {
        // required.push(key)
        // @ts-expect-error - key is string
        const element = dotenv[key]
        // @ts-expect-error - key is string
        properties[element] = {
          type: 'string',
          default: '',
        }
      }
    }

    return {
      type: 'object',
      required,
      properties,
    }
  }
}
