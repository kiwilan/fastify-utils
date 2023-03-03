import fastifyEnv from '@fastify/env'
import middie from '@fastify/middie'
import cors from '@fastify/cors'
import { FsFile, FsPath } from '@kiwilan/filesystem'
import { Environment } from '../env'
import { Middleware } from '../Middleware'
import type { LocalServer } from '.'
import type { AfterStart, BeforeStart, ServerStartOptions, ServerStartOptionsAutoMiddleware, ServerStartOptionsMiddleware, ServerStartOptionsRegister, Use } from '@/src/lib/types'

export class LocalServerStart {
  protected constructor(
    protected server: LocalServer,
    protected beforeStart?: BeforeStart,
    protected afterStart?: AfterStart,
    protected use?: Use[],
    protected apiKeyProtect?: string,
    protected register?: ServerStartOptionsRegister,
    protected autoMiddleware?: ServerStartOptionsMiddleware,
    protected middleware?: ServerStartOptionsAutoMiddleware,
  ) {
  }

  public static async make(server: LocalServer, opts: ServerStartOptions): Promise<void> {
    const self = new LocalServerStart(server)

    self.beforeStart = opts.beforeStart
    self.afterStart = opts.afterStart
    self.use = opts.use
    self.apiKeyProtect = opts.apiKeyProtect
    self.register = opts.register
    self.autoMiddleware = opts.autoMiddleware
    self.middleware = opts.middleware

    self.setOptions()

    try {
      await self.loadPluginsAndRoutes()
      await self.loadMiddlewares()
      await self.loadCors()
      await self.listen()
    }
    catch (error) {
      console.error(`Error: ${error}`)
      self.server.fastify.log.error(error)
      process.exit(1)
    }
  }

  private async listen() {
    const dotenv = await Environment.make()

    process.on('SIGTERM', async () => {
      await this.server.fastify.close()
    })

    await this.server.fastify.listen({
      host: dotenv.system.HOST,
      port: dotenv.system.PORT,
    })

    console.warn(`Server listening on ${dotenv.system.API_URL}`)

    if (this.afterStart)
      await this.afterStart(dotenv)
  }

  private async loadCors() {
    const dotenv = await Environment.make()

    if (this.register)
      this.register(this.server.fastify)

    await this.server.fastify.after()

    if (this.use?.includes('cors')) {
      await this.server.fastify.register(cors, {
        origin: dotenv.origin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin'],
        credentials: true,
        maxAge: 86400,
      })
    }
  }

  private async loadMiddlewares() {
    if (this.use?.includes('middlewares')) {
      await this.server.fastify.register(middie, {
        hook: 'onRequest',
      })

      this.server.fastify.addHook('onRequest', async (request, reply) => {
        const instance = await Middleware.make(request, reply, this.apiKeyProtect)

        if (instance.abort) {
          reply.type('application/json')
            .code(instance.code)
            .send(JSON.stringify({
              status: instance.code,
              message: instance.message,
            }))
        }

        if (this.middleware)
          this.middleware(request, reply)

        if (this.autoMiddleware) {
          const params = request.params as Record<string, string>
          const query = request.query as Record<string, string>
          const customInstance = this.autoMiddleware(query, params, request, reply)

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
  }

  private async loadPluginsAndRoutes() {
    await this.server.fastify.register(fastifyEnv, this.server.options)
    const dotenv = await Environment.make()

    if (this.use?.includes('plugins'))
      await this.load('plugins')

    if (this.use?.includes('routes'))
      await this.load('routes')

    if (this.beforeStart)
      await this.beforeStart(this.server.fastify, dotenv, this.server.isDev)
  }

  private async load(type: 'routes' | 'plugins'): Promise<string[]> {
    console.error(`Loading ${type}...`)

    const baseDir = `${this.server.isDev ? 'src' : 'build'}`
    const path = FsPath.root(`${baseDir}/${type}`)

    const files = type === 'routes'
      ? await FsFile.allFiles(path)
      : await FsFile.allFiles(path)

    const els: string[] = []
    await Promise.all(files.map(async (file) => {
      let path = file.path
      path = path.replace('.ts', this.server.isDev ? '' : '.mjs')

      try {
        const route = await import(path)
        await route.default(this.server.fastify)
      }
      catch (e) {
        console.error(e)
        throw new Error(`Import file error: ${path}`)
      }

      els.push(path)
    }))

    return els
  }

  private setOptions() {
    if (!this.use?.length)
      this.use = ['cors', 'middlewares', 'plugins', 'routes']

    console.error(`Current environment: ${this.server.isDev ? 'development' : 'production'}`)
  }
}
