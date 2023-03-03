import { FsFile } from '@kiwilan/filesystem'

export const createTsConfig = async (path = '.fastify/tsconfig.json') => {
  const config = {
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext', // "CommonJS" or "ESNext"
      moduleResolution: 'Node',
      lib: ['DOM', 'DOM.Iterable', 'ESNext'],
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      strict: true,
      resolveJsonModule: true,
      strictNullChecks: true,
      noImplicitReturns: true,
      noImplicitAny: true,
      allowJs: true,
      experimentalDecorators: true,
      useDefineForClassFields: true,
      outDir: './dist',
      paths: {
        '~/*': ['./src/*'],
        '@/*': ['./*'],
      },
    },
    include: [
      'src/**/*.ts',
    ],
  }

  const rootConfig = {
    extends: './.fastify/tsconfig.json',
    compilerOptions: {
      paths: {
        '~/*': [
          './src/*',
        ],
        '@/*': [
          './*',
        ],
      },
    },
    include: ['src/**/*.ts'],
  }

  const directory = path.split('/').slice(0, -1).join('/')
  await FsFile.makeDirectory(directory)
  await FsFile.put(path, JSON.stringify(config, null, 2))
  if (!await FsFile.exists('tsconfig.json'))
    await FsFile.put('tsconfig.json', JSON.stringify(rootConfig, null, 2))
  await FsFile.addToGitIgnore(directory)
}
