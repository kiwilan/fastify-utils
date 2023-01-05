import { appendFileSync, existsSync, readFileSync, statSync, writeFileSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path, { join } from 'path'
import { fileURLToPath } from 'url'

export default class FileUtils {
  public static root = process.cwd()
  public static dirname = fileURLToPath(new URL('.', import.meta.url))

  public static getFromRoot(path: string): string {
    return join(FileUtils.root, path)
  }

  public static getFilename(metaUrl: string): string {
    const __filename = fileURLToPath(metaUrl)

    return __filename
  }

  public static getDirname(metaUrl: string): string {
    const __dirname = path.dirname(FileUtils.getFilename(metaUrl))

    return __dirname
  }

  public static async createDirIfNotExists(path: string) {
    try {
      if (!existsSync(path))
        await mkdir(path, { recursive: true })
    }
    catch (error) {
      console.warn(error)
      throw new Error('createDirIfNotExists error')
    }
  }

  public static async createNewFile(path: string, content: string) {
    try {
      await writeFile(path, content, 'utf8')
    }
    catch (error) {
      console.warn(error)
      throw new Error('createNewFile error')
    }
  }

  public static checkIfExists(path: string): boolean {
    return existsSync(path)
  }

  public static async replaceInFile(path: string, str: string, replace: string) {
    try {
      const data = await readFile(path, 'utf8')
      const result = data.replace(str, replace)
      await writeFile(path, result, 'utf8')
    }
    catch (error) {
      console.warn(error)
      throw new Error('replaceInFile error')
    }
  }

  public static checkDirExists(dir: string): boolean {
    try {
      return statSync(dir).isDirectory()
    }
    catch (error) {
      console.warn(`Directory ${dir} does not exist`)
      return false
    }
  }

  public static async checkIfContainsAsync(path: string, str: string): Promise<boolean> {
    try {
      const contents = await readFile(path, 'utf-8')
      const result = contents.includes(str)

      return result
    }
    catch (err) {
      console.warn(err)
      throw new Error('checkIfContainsAsync error')
    }
  }

  public static async addToGitIgnore(ignore: string, path = '.gitignore') {
    const addToFile = (path: string, content: string): void => {
      const inputData = readFileSync(path).toString()
      if (!inputData.includes(content))
        appendFileSync(path, content)
    }

    const ignoreFiles = () => {
      if (!existsSync(path))
        writeFileSync(path, '')

      addToFile(path, `\n${ignore}\n`)
    }

    ignoreFiles()
  }
}
