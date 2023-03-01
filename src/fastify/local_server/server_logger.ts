import { Environment } from '../env'

export const serverLogger = () => {
  const config = Environment.make()
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
