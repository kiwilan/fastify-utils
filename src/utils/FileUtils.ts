import { appendFileSync, createReadStream, existsSync, lstat, mkdir, readFile, readFileSync, readdir, statSync, writeFile, writeFileSync } from 'fs'
import { extname, join } from 'path'
import type { ReplaceInFileBulk } from '../types'

export class FileUtils {
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

  public static createFile(path: string, content: string) {
    writeFile(path, content, 'utf8', (err) => {
      if (err) {
        console.warn(err)
        throw new Error('createFile error')
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

  public static readDirRecursively(dir: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      readdir(dir, (err, contents) => {
        if (err)
          return reject(err)

        Promise.all(
          contents.map((fileOrDirectory) => {
            return new Promise((resolve, reject) => {
              const statPath = join(dir, fileOrDirectory)
              lstat(statPath, (err, stat) => {
                if (err)
                  return reject(err)

                if (stat.isDirectory())
                  return this.readDirRecursively(statPath).then(resolve)

                resolve([statPath])
              })
            })
          }),
        )
          .then((results) => {
            return results.reduce((all: any[], x: any) => all.concat(...x), [])
          })
          .then(resolve)
          .catch(reject)
      })
    })
  }

  public static checkIfExists(path: string): boolean {
    return existsSync(path)
  }

  public static stringExistsInFile(path: string, str: string): boolean {
    const stream = createReadStream(path)
    let found = false

    stream.on('data', (d) => {
      const data = d.toString()
      if (data.includes(str))
        found = true
    })

    stream.on('error', (err) => {
      console.warn(err)
    })

    stream.on('close', () => {
      //
    })

    return found
  }

  public static replaceInFile(path: string, str: string, replace: string) {
    if (!FileUtils.checkIfExists(path))
      console.warn(`replaceInFile ${path} not found`)

    if (!FileUtils.stringExistsInFile(path, str))
      console.warn(`replaceInFile ${str} not found`)

    FileUtils.readFile(path, (data) => {
      const result = data.replaceAll(str, replace)
      FileUtils.createFile(path, result)
    })
  }

  public static replaceInFileBulk(fromPath: string, toPath: string, replace: ReplaceInFileBulk[]) {
    if (!FileUtils.checkIfExists(fromPath))
      console.warn(`replaceInFile ${fromPath} not found`)

    FileUtils.readFile(fromPath, (data) => {
      let current = data
      replace.forEach((el) => {
        current = current.replaceAll(el.from, el.to)
      })

      FileUtils.createFile(toPath, current)
    })
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
