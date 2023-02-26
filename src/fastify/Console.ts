import Fastify from 'fastify'

export class Console {
  public static print(message: any) {
    const fastify = Fastify()
    fastify.log.error(message)
  }
}
