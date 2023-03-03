import { FsFile, FsPath } from '@kiwilan/filesystem'
import { environmentProperties } from './environment_properties'
import type { EnvironmentConfig } from '@/src/lib/types'

export const environmentData = async (): Promise<EnvironmentConfig> => {
  const path = FsPath.root('.env')
  const raw = (await FsFile.get(path))
    .toString()
    .split('\n')

  const config: EnvironmentConfig = {}
  raw.forEach((el) => {
    if (el) {
      const split = el.split('=')
      const key = split[0] as keyof EnvironmentConfig | string
      let value = split[1] || undefined

      // if (!Object.keys(EnvironmentEnum).includes(key))
      //   return

      if (value?.includes('#'))
        value = value.split('#')[0].trim()

      if (key?.startsWith('#'))
        value = undefined

      if (key?.includes(' '))
        return

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      config[key] = value
    }
  })

  let k: keyof EnvironmentConfig
  for (k in config) {
    const v = config[k]
    if (v === undefined)
      config[k] = environmentProperties().getDefault()[k]
  }

  environmentProperties().generateDefault(config)

  return config
}
