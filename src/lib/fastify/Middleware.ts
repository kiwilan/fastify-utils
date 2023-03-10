import type { FastifyReply, FastifyRequest } from 'fastify'

export class Middleware {
  protected constructor(
    protected request: FastifyRequest,
    protected reply: FastifyReply,
    protected query: Record<string, string>,
    public abort = false,
    public code = 500,
    public message?: string,
  ) {}

  public static async make(request: FastifyRequest, reply: FastifyReply, protectUrl: string | undefined): Promise<Middleware> {
    const query = request.query as Record<string, string>
    const instance = new Middleware(request, reply, query)

    if (protectUrl && instance.request.url.startsWith(protectUrl))
      await instance.checkApiKey()

    return instance
  }

  private async checkApiKey() {
    const env = globalThis.dotenv
    let key = this.query?.api_key
    const headers = this.request.headers
    let authHeader = false

    if (headers.authorization !== undefined) {
      key = headers.authorization.replace('Bearer ', '')
      authHeader = true
    }

    if (env.API_KEY) {
      if (key === undefined) {
        this.message = '`api_key` query or Bearer token is required.'
        this.abort = true
      }

      if (env.API_KEY !== key && key !== undefined) {
        const currentAuth = authHeader
          ? 'Bearer token'
          : '`api_key` query'
        const altAuth = authHeader
          ? '`api_key` query'
          : 'Bearer token'
        this.message = `${currentAuth} is invalid (if you want, you can use ${altAuth} too).`
        this.abort = true
      }
      this.code = 400
    }
  }
}
