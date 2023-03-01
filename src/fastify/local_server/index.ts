import type { FastifyInstance, FastifyRegisterOptions } from 'fastify'
import type { FastifyEnvOptions } from '@fastify/env'
import Fastify from 'fastify'
import { Dotenv } from '../Dotenv'
import { LocalServerStart, logger } from './build'
import type { ServerStartOptions } from '@/src/types'

export class LocalServer {
  protected constructor(
    public fastify: FastifyInstance,
    public options: FastifyRegisterOptions<FastifyEnvOptions> | undefined,
    public isDev: boolean = false,
  ) {
  }

  public static make(): LocalServer {
    const dotenv = Dotenv.make()

    const fastify = Fastify({
      logger: logger(),
      ignoreTrailingSlash: true,
    })
    const config = new LocalServer(fastify, {
      confKey: 'config',
      schema: dotenv.getSchema(),
      data: process.env,
      dotenv: true,
    })

    console.error('Server initialized', process.env.NODE_ENV)
    config.isDev = process.env.NODE_ENV === 'development'

    return config
  }

  public async start(opts: ServerStartOptions): Promise<void> {
    await LocalServerStart.make(this, opts)
  }
}