import { FileUtils } from '@/src/utils'

export const createTsConfig = (path = '.fastify/tsconfig.json') => {
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
  FileUtils.createDirIfNotExists(directory)
  FileUtils.createFile(path, JSON.stringify(config, null, 2))
  if (!FileUtils.checkIfExists('tsconfig.json'))
    FileUtils.createFile('tsconfig.json', JSON.stringify(rootConfig, null, 2))
  FileUtils.addToGitIgnore(directory)
}
