import type { DotenvExtends } from '../types'

export class DotenvDomains {
  protected constructor(
    protected data: DotenvExtends,
    public domains: string[] = [],
    public allAllowed: boolean = false,
    public origin: string | string[] = '*',
  ) {
  }

  public static async make(data: DotenvExtends): Promise<DotenvDomains> {
    const self = new DotenvDomains(data)

    self.domains = self.setDomains()
    self.allAllowed = self.domains.includes('*')
    self.origin = self.allAllowed ? '*' : self.domains

    return self
  }

  private setDomains(): string[] {
    const envDomains = this.data.API_DOMAINS ?? []
    const domains: string[] = []
    let allow = false

    if (envDomains && envDomains[0] === '*')
      allow = true

    if (allow) {
      domains.push('*')
    }
    else {
      envDomains.forEach((domain) => {
        if (domain.startsWith('*')) {
          const domainParsed = domain.replace('*.', '')
          domains.push(`http://${domainParsed}`)
          domains.push(`https://${domainParsed}`)
        }

        if (domain.includes('localhost')) {
          const localhostIP = domain.replace('localhost', '127.0.0.1')
          domains.push(`http://${localhostIP}`)
          domains.push(`https://${localhostIP}`)
        }

        domains.push(`http://${domain}`)
        domains.push(`https://${domain}`)
      })
    }

    return domains
  }
}
