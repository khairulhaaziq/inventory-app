import { productService } from '../services/product.service';
import { describe, expect, it } from 'vitest'
import app from '../index'

const ENDPOINT = '/api/inventory'
describe(ENDPOINT, async () => {
  describe('GET', () => {
    it('should respond with a `200` status code', async () => {
      const res = await app.request(ENDPOINT, {headers: {'Authorization': 'Bearer haha'}})
      expect(res.status).toBe(200)
    })

    it('should respond with product details', async () => {
      const res = await app.request(ENDPOINT, {headers: {'Authorization': 'Bearer haha'}})
      const json = await res.json()
      const suppliers = await productService.findProducts({limit: 25, page: 1})
      expect(json.data.length).toBe(suppliers[1])
    })

    it('should respond with pagination format', async () => {
      const res = await app.request(ENDPOINT)
      const json = await res.json()
      const suppliers = await productService.findProducts({limit: 25, page: 1})
      expect(json.data.length).toBe(suppliers[1] + 1)
    })
  })
})

describe(`${ENDPOINT}/:id`, async () => {
  describe('GET', () => {
    it('should respond with a `200` status code', async () => {
      const res = await app.request(`${ENDPOINT}/1`)
      expect(res.status).toBe(200)
    })

    it('should respond with product details', async () => {
      const res = await app.request(ENDPOINT)
      const json = await res.json()
      const supplier = await productService.findProduct(1)
      expect(json.data).toBe(supplier)
    })
  })
})
