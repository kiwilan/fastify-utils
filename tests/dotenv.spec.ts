import { expect, it } from 'vitest'

import { Environment } from '../src/env'

it('server test', async () => {
  const env = await Environment.make()
  const dotenv = env.dotenv

  expect(dotenv.LOG_LEVEL).toBe('debug')
  expect(dotenv.PORT).toBe(3000)
  expect(dotenv.BASE_URL).toBe('localhost')
  expect(dotenv.API_URL).toBe('http://localhost') // TODO: fix this
  expect(dotenv.API_DOMAINS).toEqual([])
  expect(dotenv.API_DOMAINS_PARSED).toEqual([])
  expect(dotenv.API_DOMAINS_ALL).toBe(false)
  expect(dotenv.API_KEY).toBe('')
  expect(dotenv.HTTPS).toBe(false)
  expect(dotenv.ORIGIN).toStrictEqual([])
  expect(dotenv.CLUSTER).toBe(false)
  expect(dotenv.NODE_ENV).toBe('test')
  expect(dotenv.IS_DEV).toBe(true)
  expect(dotenv.HOST).toBe('localhost')
})
