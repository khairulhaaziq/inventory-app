import { Hono } from 'hono'
import { inventoryService } from '../services/inventory.service'
import { responsePaginate } from '../utils/pagination'
import { inventoryValidator } from '../validators/inventory.validator'
import { authMiddleware } from '../middlewares/authentication'

const app = new Hono()

app
  .get('/inventory', authMiddleware, async (c)=>{
    const name = c.req.query().name
    const sort = c.req.query().sort
    const pageQuery = c.req.query().page
    const limitQuery = c.req.query().limit

    const page = pageQuery ? parseInt(pageQuery) : 1
    const limit = limitQuery ? parseInt(limitQuery) : 25

    try {
      const products = await inventoryService.findInventories({page, limit, name, sort})
      return c.json(responsePaginate(products[0], products[1], page, limit))
    } catch (e) {
      console.log(e)
      return c.newResponse('Internal Server Error', {status: 500})
    }
  })

  .get('/inventory/:id', authMiddleware, async (c)=>{
    const id = parseInt(c.req.param().id)
    if (isNaN(id)) {
      console.log('Error: Invalid id param')
      return c.newResponse('Bad Request', {status: 400})
    }

    try {
      const product = await inventoryService.findInventory(id)
      if (product) {
        return c.json(product)
      }
      return c.notFound()
    } catch (e) {
      console.log(e)
      return c.newResponse('Internal Server Error', {status: 500})
    }
  })

  .post('/add-inventory', authMiddleware, inventoryValidator.createInventory, async (c) => {
    try {
      const product = await inventoryService.createInventory(c.req.valid('json'), c.get('userId'))
      if (product) {
        return c.json(product)
      }
      return c.notFound()
    } catch (e) {
      console.log(e)
      return c.newResponse('Internal Server Error', {status: 500})
    }
  })

  .patch('/update-inventory', authMiddleware, inventoryValidator.updateInventory, async (c) => {
    try {
      const product = await inventoryService.updateInventory(c.req.valid('json'))
      if (product) {
        return c.json(product)
      }
      return c.notFound()
    } catch (e) {
      console.log(e)
      return c.newResponse('Internal Server Error', {status: 500})
    }
  })

  .delete('/delete-inventory', authMiddleware, inventoryValidator.deleteInventory, async (c) => {
    try {
      const product = await inventoryService.deleteInventory(c.req.valid('json').productId)
      if (product) {
        return c.json(product)
      }
      return c.notFound()
    } catch (e) {
      console.log(e)
      return c.newResponse('Internal Server Error', {status: 500})
    }
  })

export {app as inventoryRoutes}
