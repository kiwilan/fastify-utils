import { readFile, readdir, writeFile } from 'fs/promises'
import { extname } from 'path'

export default class FileUtilsPromises {
  public static async createFile(path: string, content: string) {
    try {
      await writeFile(path, content, 'utf8')
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
    const stringExists = await FileUtilsPromises.stringExistsInFile(path, str)

    // if (!fileExists)
    //   throw new Error(`promise replaceInFile ${path} not found`)

    // if (!stringExists)
    //   throw new Error(`promise replaceInFile ${str} not found`)

    const data = await FileUtilsPromises.readFile(path)
    const result = data.replace(str, replace)
    await FileUtilsPromises.createFile(path, result)
  }
}
