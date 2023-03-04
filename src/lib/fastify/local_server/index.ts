import type { FastifyInstance, FastifyRegisterOptions } from 'fastify'
import type { FastifyEnvOptions } from '@fastify/env'
import Fastify from 'fastify'
import { Environment } from '../../env'
import { serverLogger } from './server_logger'
import { LocalServerStart } from './local_server_start'
import type { ServerStartOptions } from '@/src/lib/types'

interface ISchema {
  type: 'object'
  required: never[]
  properties: {
    [key: string]: string
  }
}

export class LocalServer {
  protected constructor(
    public fastify: FastifyInstance,
    public options: FastifyRegisterOptions<FastifyEnvOptions> | undefined,
    public isDev: boolean = false,
  ) {
  }

  public static async run(opts: ServerStartOptions): Promise<LocalServer> {
    const env = await Environment.make()
    // @ts-expect-error - globalThis is global
    globalThis.dotenv = env.dotenv

    const fastify = Fastify({
      logger: await serverLogger(),
      ignoreTrailingSlash: true,
    })
    const self = new LocalServer(fastify, {
      confKey: 'config',
      schema: this.setFastifySchema(),
      data: process.env,
      dotenv: true,
    })

    console.error('Server initialized', process.env.NODE_ENV)
    self.isDev = process.env.NODE_ENV === 'development'

    await LocalServerStart.make(self, opts)

    return self
  }

  private static setFastifySchema(): ISchema {
    const required = globalThis.dotenv
    const properties = {}

    for (const key in required) {
      if (Object.prototype.hasOwnProperty.call(required, key)) {
        // @ts-expect-error - key is string
        const element = required[key]
        // @ts-expect-error - key is string
        properties[element] = {
          type: 'string',
          default: '',
        }
      }
    }

    return {
      type: 'object',
      required: required as unknown as never[],
      properties,
    }
  }
}
