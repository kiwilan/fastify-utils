import { fileURLToPath } from 'node:url'

export function packagePath(path: string): string {
  return fileURLToPath(new URL('.', import.meta.url))
}
