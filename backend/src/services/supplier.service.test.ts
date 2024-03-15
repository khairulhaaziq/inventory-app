import { describe, beforeEach, expect, it, vi } from 'vitest' // 👈🏻 Added the `vi` import
import { supplierService } from './supplier.service'
import prismaMock from '../libs/__mocks__/prisma'

vi.mock('../libs/prisma.ts')

describe("supplierService", ()=>{
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  describe("findSuppliers", () => {
    it('should return suppliers with count', async () => {
      const mockSupplier = {name:'supplier1'}
      const mockResponse = [{id: 1, name:'supplier1'}, 1]
      prismaMock.$transaction.mockResolvedValueOnce(mockResponse)
      const suppliers = await supplierService.findSuppliers({limit: 25, page: 1})
      expect(suppliers).toStrictEqual([{ ...mockSupplier, id: 1 }, 1])
    })
  })

  describe("createSupplier", () => {
    it('should return the generated supplier', async () => {
      const newSupplier = {name:'supplier1'}
      prismaMock.supplier.create.mockResolvedValueOnce({...newSupplier, id: 1 })
      const supplier = await supplierService.createSupplier(newSupplier)
      expect(supplier).toStrictEqual({ ...newSupplier, id: 1 })
    })
  })
})
