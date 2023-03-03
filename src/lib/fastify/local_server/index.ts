import type { FastifyInstance, FastifyRegisterOptions } from 'fastify'
import type { FastifyEnvOptions } from '@fastify/env'
import Fastify from 'fastify'
import { Environment } from '../env'
import { serverLogger } from './server_logger'
import { LocalServerStart } from './local_server_start'
import type { ServerStartOptions } from '@/src/lib/types'

export class LocalServer {
  protected constructor(
    public fastify: FastifyInstance,
    public options: FastifyRegisterOptions<FastifyEnvOptions> | undefined,
    public isDev: boolean = false,
  ) {
  }

  public static async run(opts: ServerStartOptions): Promise<LocalServer> {
    const environment = await Environment.make()

    const fastify = Fastify({
      logger: await serverLogger(),
      ignoreTrailingSlash: true,
    })
    const self = new LocalServer(fastify, {
      confKey: 'config',
      schema: environment.getSchema(),
      data: process.env,
      dotenv: true,
    })

    console.error('Server initialized', process.env.NODE_ENV)
    self.isDev = process.env.NODE_ENV === 'development'

    await LocalServerStart.make(self, opts)

    return self
  }
}
