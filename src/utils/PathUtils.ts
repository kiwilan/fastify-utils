import path, { join } from 'path'
import { fileURLToPath } from 'url'

export class PathUtils {
  public static root = process.cwd()
  public static dirname = fileURLToPath(new URL('.', import.meta.url))

  public static getFromRoot(path: string): string {
    return join(PathUtils.root, path)
  }

  public static getFromPackage(path: string): string {
    return join(PathUtils.dirname, path)
  }

  public static getFilename(metaUrl: string): string {
    const __filename = fileURLToPath(metaUrl)

    return __filename
  }

  public static getDirname(metaUrl: string): string {
    const __dirname = path.dirname(PathUtils.getFilename(metaUrl))

    return __dirname
  }
}
