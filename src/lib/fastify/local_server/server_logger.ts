import { Environment } from '../env'

export const serverLogger = async () => {
  const dotenv = await Environment.make()
  const logger = process.env.NODE_ENV_LOG === 'production'
    ? { level: dotenv.data.LOG_LEVEL }
    : {
        level: dotenv.data.LOG_LEVEL,
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
