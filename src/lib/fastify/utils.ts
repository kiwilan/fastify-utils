import { fileURLToPath } from 'url'

export const packagePath = (path: string): string => {
  return fileURLToPath(new URL('.', import.meta.url))
}
