import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { Dotenv, LocalServer } from '../fastify'
import type { Endpoint } from './router'

export type Use = 'plugins' | 'routes' | 'middlewares' | 'cors'
export type BeforeStart = (fastify: FastifyInstance, dotenv: Dotenv, isDev: boolean) => Promise<void>
export type AfterStart = (dotenv: Dotenv) => Promise<void>

export interface MiddlewareReturn {
  endpoint: Endpoint
  condition: boolean
  abort?: boolean
  code?: 400 | 401 | 403 | 404 | 500
  message?: string
}

export type ServerStartOptionsRegister = (fastify: FastifyInstance) => void
export type ServerStartOptionsMiddleware = (
  query: Record<string, string>,
  params: Record<string, string>,
  request: FastifyRequest,
  reply: FastifyReply,
) => MiddlewareReturn[]
export type ServerStartOptionsAutoMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply,
) => void

export interface ServerStartOptions {
  server: LocalServer
  beforeStart?: BeforeStart
  afterStart?: AfterStart
  use?: Use[]
  /**
   * Set an base URL to protect with API key, all routes nested under this URL will be protected.
   *
   * @example
   * `/api`
   */
  apiKeyProtect?: string
  register?: ServerStartOptionsRegister
  autoMiddleware?: ServerStartOptionsMiddleware
  middleware?: ServerStartOptionsAutoMiddleware
}
