export const serverLogger = async () => {
  const logger = process.env.NODE_ENV_LOG === 'production'
    ? { level: dotenv.LOG_LEVEL }
    : {
        level: dotenv.LOG_LEVEL,
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
