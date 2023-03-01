export const corsDomains = () => {
  const fromEnvironment = (): string[] => {
    let domains: string[] = []
    if (process.env.API_DOMAINS)
      domains = process.env.API_DOMAINS?.split(',')

    return domains
  }

  const parsed = (): string[] => {
    const envDomains = fromEnvironment()
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

  return {
    fromEnvironment,
    parsed,
  }
}
