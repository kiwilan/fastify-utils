import { appendFile, mkdir, readFile, readdir, writeFile } from 'fs/promises'
import { extname, resolve } from 'path'

export class FileUtilsPromises {
  public static async createFile(path: string, content: string) {
    try {
      if (path.includes('/')) {
        const targetDir = path.split('/').slice(0, -1).join('/')
        await mkdir(targetDir, { recursive: true })
      }
      await writeFile(path, content, { encoding: 'utf8', flag: 'w' })
    }
    catch (error) {
      console.warn(error)
      throw new Error('promise createFile error')
    }
  }

  public static async readFile(path: string): Promise<string> {
    try {
      return await readFile(path, 'utf8')
    }
    catch (error) {
      console.warn(error)
      throw new Error('promise readFile error')
    }
  }

  public static async readDir(path: string, extension?: string): Promise<string[]> {
    try {
      let files = await readdir(path)
      if (extension)
        files = files.filter(e => extname(e).toLowerCase() === `.${extension}`)

      return files
    }
    catch (error) {
      console.warn(error)
      throw new Error('promise readDir error')
    }
  }

  public static async readDirRecursively(dir: string, extensions: string[] = []): Promise<string[]> {
    const dirents = await readdir(dir, { withFileTypes: true })
    const files = await Promise.all(dirents.map((dirent) => {
      const res = resolve(dir, dirent.name)
      return dirent.isDirectory() ? this.readDirRecursively(res, extensions) : res
    }))

    let list = Array.prototype.concat(...files)

    if (extensions.length > 0)
      list = list.filter(e => extensions.includes(extname(e).toLowerCase()))

    return list
  }

  public static async stringExistsInFile(path: string, str: string): Promise<boolean> {
    const data = (await readFile(path)).toString()
    if (!data.includes(str))
      return false

    return true
  }

  public static async checkIfFileExists(path: string): Promise<boolean> {
    try {
      await readFile(path)
      return true
    }
    catch (error) {
      return false
    }
  }

  public static async checkIfDirExists(path: string): Promise<boolean> {
    try {
      await readdir(path)
      return true
    }
    catch (error) {
      return false
    }
  }

  public static async replaceInFile(path: string, str: string, replace: string): Promise<void> {
    const fileExists = await FileUtilsPromises.checkIfFileExists(path)
    const stringExists = FileUtilsPromises.stringExistsInFile(path, str)

    if (!fileExists)
      console.warn(`promise replaceInFile ${path} not found`)

    if (!stringExists)
      console.warn(`promise replaceInFile ${str} not found`)

    const data = await FileUtilsPromises.readFile(path)
    const result = data.replace(str, replace)
    await FileUtilsPromises.createFile(path, result)
  }

  public static async addToGitIgnore(ignore: string, path = '.gitignore') {
    const addToFile = async (path: string, content: string): Promise<void> => {
      const inputData = await FileUtilsPromises.readFile(path)
      if (!inputData.includes(content))
        await appendFile(path, content)
    }

    const ignoreFiles = async () => {
      if (!await FileUtilsPromises.checkIfFileExists(path))
        await FileUtilsPromises.createFile(path, '')

      await addToFile(path, `\n${ignore}\n`)
    }

    await ignoreFiles()
  }
}
