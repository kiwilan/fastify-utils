import type { EnvironmentConfig } from '@/src/lib/types'
import { EnvironmentEnum } from '@/src/lib/types'

export const environmentProperties = () => {
  const generate = (): string[] => {
    const properties: string[] = []
    Object.keys(EnvironmentEnum).forEach((element) => {
      if (isNaN(parseInt(element)))
        properties.push(element)
    })

    return properties
  }

  const getDefault = (): EnvironmentConfig => {
    return {
      LOG_LEVEL: 'info',
      PORT: '3000',
      BASE_URL: 'localhost',
    }
  }

  const generateDefault = (config: EnvironmentConfig): void => {
    const properties = getDefault()
    Object.keys(properties).forEach((element) => {
      if (!config[element as keyof EnvironmentConfig])
        config[element as keyof EnvironmentConfig] = properties[element as keyof EnvironmentConfig]
    })
  }

  return {
    generate,
    generateDefault,
    getDefault,
  }
}
