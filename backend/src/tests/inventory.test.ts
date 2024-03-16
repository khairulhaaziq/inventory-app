import { describe, expect, it } from 'vitest'
import app from '../index'
import { inventoryService } from '../services/inventory.service'
import prisma from '../libs/prisma'

const ENDPOINT = '/api/inventory'
describe(ENDPOINT, async () => {
  describe('GET', async () => {
    describe('without validation', async ()=> {
      it('it should respond with a `401` status code', async () => {
        const res = await app.request(ENDPOINT, {headers: {}})
        expect(res.status).toBe(401)
      })
    })

    describe('with validation', async ()=> {

      it('should respond with a `200` status code', async () => {
        const session = await getSession()
        const res = await app.request(ENDPOINT, {headers: {'Authorization': `Bearer ${session?.id}`}})

        expect(res.status).toBe(200)
      })

      it('should return correct count with limit', async () => {
        const session = await getSession()
        const res = await app.request(ENDPOINT, {headers: {'Authorization': `Bearer ${session?.id}`}})
        const json = await res.json()
        expect(json.data.length).toBe(25)
      })

      it('should return total product count', async () => {
        const session = await getSession()
        const res = await app.request(ENDPOINT, {headers: {'Authorization': `Bearer ${session?.id}`}})
        const json = await res.json()
        const count = await prisma.productInventory.count()
        expect(json.meta.pagination.total_count).toBe(count)
      })

      it('should respond with product details', async () => {
        const session = await getSession()
        const res = await app.request(ENDPOINT, {headers: {'Authorization': `Bearer ${session?.id}`}})
        const json = await res.json()
        const inventories = await inventoryService.findInventories({})
        expect(JSON.stringify(json.data[0])).toStrictEqual(JSON.stringify(inventories[0][0]))
      })
    })
  })
})

describe(`${ENDPOINT}/:id`, async () => {
  describe('GET', () => {
    describe('without validation', async ()=> {
      const res = await app.request(`${ENDPOINT}/1`, {headers: {}})
      it('it should respond with a `401` status code', () => {
        expect(res.status).toBe(401)
      })
    })

    describe('with validation', async ()=> {
      it('should respond with a `200` status code', async () => {
        const session = await getSession()
        const product = await prisma.product.findFirst()
        const res = await app.request(`${ENDPOINT}/${product!.id}`, {headers: {'Authorization': `Bearer ${session?.id}`}})
        expect(res.status).toBe(200)
      })

      it('should respond with product details', async () => {
        const session = await getSession()
        const product = await prisma.product.findFirst()
        const res = await app.request(`${ENDPOINT}/${product!.id}`, {headers: {'Authorization': `Bearer ${session?.id}`}})
        const json = await res.json()
        const inventory = await inventoryService.findInventory(product!.id)
        expect(JSON.stringify(json)).toStrictEqual(JSON.stringify(inventory))
      })
    })
  })
})

const ADD_INVENTORY_ENDPOINT = '/api/add-inventory'
describe(ADD_INVENTORY_ENDPOINT, async () => {
  describe('POST', () => {
    describe('without validation', async ()=> {
      const res = await app.request(ADD_INVENTORY_ENDPOINT, {method: 'POST', headers: {}})
      it('it should respond with a `401` status code', () => {
        expect(res.status).toBe(401)
      })
    })

    describe('with validation', async ()=> {
      it('without valid body, should respond with a `400` status code', async () => {
        const session = await getSession()
        const res = await app.request(ADD_INVENTORY_ENDPOINT, {method: 'POST', headers: {'Authorization': `Bearer ${session?.id}`}})
        expect(res.status).toBe(400)
      })

      it('with valid body and json content type header, should respond with a `200` status code', async () => {
        const session = await getSession()
        const res = await app.request(ADD_INVENTORY_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify({product: {name: 'New test product', price: 13.23}, quantity: 2}),
          headers: {'Authorization': `Bearer ${session?.id}`, 'Content-Type': 'application/json'}
        })
        expect(res.status).toBe(200)
      })

      it('with valid body and json content type header, should add a new product and return the created product', async () => {
        const session = await getSession()
        const res = await app.request(ADD_INVENTORY_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify({product: {name: 'New test product', price: 13.23}, quantity: 2}),
          headers: {'Authorization': `Bearer ${session?.id}`, 'Content-Type': 'application/json'}
        })
        const json = await res.json()

        const product = await prisma.productInventory.findFirst({orderBy: {product: {createdAt: 'desc'}}})
        expect(json).toStrictEqual(product)
      })
    })
  })
})

const UPDATE_INVENTORY_ENDPOINT = '/api/update-inventory'
describe(UPDATE_INVENTORY_ENDPOINT, async () => {
  describe('PATCH', () => {
    describe('without validation', async ()=> {
      const res = await app.request(UPDATE_INVENTORY_ENDPOINT, {method: 'PATCH', headers: {}})
      it('it should respond with a `401` status code', () => {
        expect(res.status).toBe(401)
      })
    })

    describe('with validation', async ()=> {
      it('without valid body, should respond with a `400` status code', async () => {
        const session = await getSession()
        const res = await app.request(UPDATE_INVENTORY_ENDPOINT, {method: 'PATCH', headers: {'Authorization': `Bearer ${session?.id}`}})
        expect(res.status).toBe(400)
      })

      it('with valid body and json content type header, should respond with a `200` status code', async () => {
        const session = await getSession()
        const product = await prisma.productInventory.findFirst({orderBy: {product: {createdAt: 'desc'}}})
        const res = await app.request(UPDATE_INVENTORY_ENDPOINT, {
          method: 'PATCH',
          body: JSON.stringify({productId: product?.productId, product: {name: 'New test product', price: 13.23}, quantity: 2}),
          headers: {'Authorization': `Bearer ${session?.id}`, 'Content-Type': 'application/json'}
        })
        expect(res.status).toBe(200)
      })

      describe('with valid body and json content type header', async () => {

        it('with valid body and json content type header, should update the selected product', async () => {
          const session = await getSession()
          const product = await prisma.productInventory.findFirst({orderBy: {product: {createdAt: 'desc'}}})
          const newName = 'Updated test product'
          const newQty = 5
          const newPrice = 15.34
          const res = await app.request(UPDATE_INVENTORY_ENDPOINT, {
            method: 'PATCH',
            body: JSON.stringify({productId: product?.productId, product: {name: newName, price: newPrice}, quantity: newQty}),
            headers: {'Authorization': `Bearer ${session?.id}`, 'Content-Type': 'application/json'}
          })
          const updatedProduct = await prisma.productInventory.findFirst({where: {productId: product?.productId}, include: {product: true}})
          expect(updatedProduct?.product.name).toEqual(newName)
          expect(updatedProduct?.product.price).toEqual(newPrice)
          expect(updatedProduct?.quantity).toEqual(newQty)
        })

        it('with valid body and json content type header, should return the updated product', async () => {
          const session = await getSession()
          const product = await prisma.productInventory.findFirst({orderBy: {product: {createdAt: 'desc'}}})
          const newName = 'Updated test product'
          const newQty = 5
          const newPrice = 15.34
          const res = await app.request(UPDATE_INVENTORY_ENDPOINT, {
            method: 'PATCH',
            body: JSON.stringify({productId: product?.id, product: {name: newName, price: newPrice}, quantity: newQty}),
            headers: {'Authorization': `Bearer ${session?.id}`, 'Content-Type': 'application/json'}
          })
          const json = await res.json()

          const updatedProduct = await prisma.productInventory.findFirst({where: {productId: product?.id}})
          expect(json).toStrictEqual(updatedProduct)
        })
      })
    })
  })
})

const DELETE_INVENTORY_ENDPOINT = '/api/delete-inventory'
describe(DELETE_INVENTORY_ENDPOINT, async () => {
  describe('DELETE', () => {
    describe('without validation', async ()=> {
      const res = await app.request(DELETE_INVENTORY_ENDPOINT, {method: 'DELETE', headers: {}})
      it('it should respond with a `401` status code', () => {
        expect(res.status).toBe(401)
      })
    })

    describe('with validation', async ()=> {
      it('without valid body, should respond with a `400` status code', async () => {
        const session = await getSession()
        const res = await app.request(DELETE_INVENTORY_ENDPOINT, {method: 'DELETE', headers: {'Authorization': `Bearer ${session?.id}`}})
        expect(res.status).toBe(400)
      })

      it('with valid body and json content type header, should respond with a `200` status code', async () => {
        const session = await getSession()
        const product = await prisma.productInventory.findFirst({orderBy: {product: {createdAt: 'desc'}}})
        const res = await app.request(DELETE_INVENTORY_ENDPOINT, {
          method: 'DELETE',
          body: JSON.stringify({productId: product?.productId}),
          headers: {'Authorization': `Bearer ${session?.id}`, 'Content-Type': 'application/json'}
        })
        expect(res.status).toBe(200)
      })

      describe('with valid body and json content type header', async () => {

        it('with valid body and json content type header, should delete the selected product', async () => {
          const session = await getSession()
          const product = await prisma.productInventory.findFirst({orderBy: {product: {createdAt: 'desc'}}})
          await app.request(DELETE_INVENTORY_ENDPOINT, {
            method: 'DELETE',
            body: JSON.stringify({productId: product?.productId}),
            headers: {'Authorization': `Bearer ${session?.id}`, 'Content-Type': 'application/json'}
          })
          const deletedProduct = await prisma.productInventory.findFirst({where: {productId: product?.productId}})
          expect(deletedProduct).toEqual(null)
        })

        it('with valid body and json content type header, should return the deleted product', async () => {
          const session = await getSession()
          const product = await prisma.productInventory.create({data: {product: {create: {name: 'New test product', price: 13.23 }}, quantity: 2}, select: {productId: true, product: true}})
          const res = await app.request(DELETE_INVENTORY_ENDPOINT, {
            method: 'DELETE',
            body: JSON.stringify({productId: product?.productId}),
            headers: {'Authorization': `Bearer ${session?.id}`, 'Content-Type': 'application/json'}
          })
          const json = await res.json()
          expect(JSON.stringify(json)).toStrictEqual(JSON.stringify(product.product))
        })
      })
    })
  })
})

async function getSession() {
  const user = await prisma.user.findFirst()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate()+7)
  await prisma.session.upsert({where: {userId: user!.id}, create: {expiresAt: sevenDaysFromNow, userId: user!.id}, update: {expiresAt: sevenDaysFromNow}})
  return  await prisma.session.findFirst()
}
