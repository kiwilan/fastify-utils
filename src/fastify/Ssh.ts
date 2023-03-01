import { chmod, unlink, writeFile } from 'fs/promises'
import { execSync } from 'child_process'

export interface SshEnvironmentConfig {
  sshHost?: string
  sshPort?: string
  sshUser?: string
  sshPassword?: string
  sshPrivateKeyPath?: string
}
type Callback = (line: string) => void

export class SSH {
  protected constructor(
    protected keyPath: string,
    protected config: SshEnvironmentConfig,
    protected pool?: string,
  ) {}

  public static async make(dotenv: SshEnvironmentConfig): Promise<SSH> {
    const ssh = new SSH(`${process.cwd()}/key`, dotenv)
    await ssh.withKey()
    ssh.pool = ssh.setPool()

    return ssh
  }

  public async getFilesInPath(path: string, callback?: Callback): Promise<string[]> {
    const commands = [
      `cd ${path}`,
      'find . -ls',
      'exit',
    ]

    return this.execute(commands, (line) => {
      if (callback)
        callback(line)
    })
  }

  public async execute(commands: string[], callback?: Callback): Promise<string[]> {
    const commandsList = commands.join(' && ')

    let result
    try {
      result = execSync(`${this.pool} '${commandsList}'`).toString()
    }
    catch (error) {
      console.error(error)
    }

    if (!result)
      return []

    const splitted = result.split('\n')
    const output: string[] = []

    splitted.forEach((line) => {
      output.push(line)
      if (callback)
        callback(line)
    })

    await unlink(this.keyPath).catch(() => {})

    return output
  }

  private async withKey(): Promise<boolean> {
    const privateKeyPath = this.config.sshPrivateKeyPath || '~/.ssh/id_ed25519'
    const commands = [
      `cat ${privateKeyPath}`,
    ]
    const commandsList = commands.join(' && ')

    let result
    try {
      result = execSync(`${commandsList}`).toString()
    }
    catch (error) {
      console.error(error)
    }

    if (!result)
      return false

    await unlink(this.keyPath).catch(() => {})
    await writeFile(this.keyPath, result)
    await chmod(this.keyPath, 0o600)

    return true
  }

  private setPool(): string {
    const host = this.config.sshHost || 'localhost'
    const port = this.config.sshPort || '22'
    const username = this.config.sshUser || 'root'
    // const password = this.config.sshPassword
    const privateKeyPath = this.keyPath

    return `ssh -i ${privateKeyPath} ${username}@${host} -p ${port}`
  }
}
