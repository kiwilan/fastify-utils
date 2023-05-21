import { fileURLToPath } from 'node:url'

export function packagePath(): string {
  return fileURLToPath(new URL('.', import.meta.url))
}
