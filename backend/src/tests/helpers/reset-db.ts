import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async () => {
  await prisma.$transaction([
    prisma.product.deleteMany(),
    prisma.productInventory.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.user.deleteMany()
  ])
}
