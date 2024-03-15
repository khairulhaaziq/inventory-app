import { validator } from 'hono/validator'

import { z } from 'zod'

const createInventorySchema = z.object({
  product: z.object({
    name: z.string(),
    price: z.number(),
  }),
  quantity: z.number().int()
})
const createInventory = validator('json', (value, c) => {
  const parsed = createInventorySchema.safeParse(value)
  if (!parsed.success) {
    return c.text('Invalid request!', 400)
  }
  return parsed.data
})

const updateInventorySchema = z.object({
  productId: z.number(),
  product: z.object({
    name: z.string(),
    price: z.number(),
  }),
  quantity: z.number().int()
})
const updateInventory = validator('json', (value, c) => {
  const parsed = updateInventorySchema.safeParse(value)
  if (!parsed.success) {
    return c.text('Invalid request!', 400)
  }
  return parsed.data
})

const deleteInventorySchema = z.object({
  productId: z.number(),
})
const deleteInventory = validator('json', (value, c) => {
  const parsed = deleteInventorySchema.safeParse(value)
  if (!parsed.success) {
    return c.text('Invalid request!', 400)
  }
  return parsed.data
})

export const inventoryValidator = {
  createInventorySchema,
  createInventory,
  updateInventorySchema,
  updateInventory,
  deleteInventorySchema,
  deleteInventory
}
