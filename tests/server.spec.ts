import { expect, it } from 'vitest'

import { Server } from '../dist'

it('server test', async () => {
  const server = await Server.run({})

  expect(server.isDev).toBe(true)
})
