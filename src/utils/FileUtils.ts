import { appendFileSync, existsSync, mkdir, readFile, readFileSync, readdir, statSync, writeFile, writeFileSync } from 'fs'
import path, { extname, join } from 'path'
import { fileURLToPath } from 'url'

export default class FileUtils {
  public static root = process.cwd()
  public static dirname = fileURLToPath(new URL('.', import.meta.url))

  public static getFromRoot(path: string): string {
    return join(FileUtils.root, path)
  }

  public static getFromPackage(path: string): string {
    return join(FileUtils.dirname, path)
  }

  public static getFilename(metaUrl: string): string {
    const __filename = fileURLToPath(metaUrl)

    return __filename
  }

  public static getDirname(metaUrl: string): string {
    const __dirname = path.dirname(FileUtils.getFilename(metaUrl))

    return __dirname
  }

  public static createDirIfNotExists(path: string) {
    if (!existsSync(path)) {
      mkdir(path, { recursive: true }, (err) => {
        if (err) {
          console.warn(err)
          throw new Error('createDirIfNotExists error')
        }
      })
    }
  }

  public static createNewFile(path: string, content: string) {
    writeFile(path, content, 'utf8', (err) => {
      if (err) {
        console.warn(err)
        throw new Error('createNewFile error')
      }
    })
  }

  public static readFile(path: string, callback?: (data: string) => void): void {
    readFile(path, 'utf8', (err, data) => {
      if (err) {
        console.warn(err)
        throw new Error('readFile error')
      }

      if (callback)
        callback(data)
    })
  }

  public static readDir(path: string, callback?: (files: string[]) => void, extension?: string): void {
    readdir(path, (err, files) => {
      if (err) {
        console.warn(err)
        throw new Error('readDir error')
      }

      if (extension)
        files = files.filter(e => extname(e).toLowerCase() === `.${extension}`)

      if (callback)
        callback(files)
    })
  }

  public static checkIfExists(path: string): boolean {
    return existsSync(path)
  }

  public static replaceInFile(path: string, str: string, replace: string) {
    if (!FileUtils.checkIfExists(path))
      throw new Error('replaceInFile File not found')

    FileUtils.replaceInFile(
      path,
      str,
      replace,
    )
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

  public static checkIfContainsAsync(path: string, str: string): boolean {
    let result = false
    FileUtils.readFile(path, (data) => {
      result = data.includes(str)
    })

    return result
  }

  public static addToGitIgnore(ignore: string, path = '.gitignore') {
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
