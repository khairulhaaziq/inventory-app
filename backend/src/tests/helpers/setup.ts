import resetDb from './reset-db'
import { beforeEach, } from 'vitest'
import { seed } from './seed-db'

beforeEach(async () => {
  await resetDb()
  await seed()
})
