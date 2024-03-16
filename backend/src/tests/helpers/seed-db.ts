import bcrypt from 'bcrypt';
import { Prisma, PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient()

export async function seed() {
  await seedRoles()
  await seedUsers()
  await seedSuppliers()
  await seedProductsAndInventories()
  console.log(`Database has been seeded. 🌱`);
}

async function seedRoles() {
  const data: Prisma.RoleCreateInput[] = [
    {name: 'guest'},
    {name: 'admin'},
  ]

  await Promise.all(data.map(async (d) => {
    try {
      await prisma.role.create({
        data: d,
      });
      console.log(`successfully created ${d.name} role`)
    } catch {
      console.log(`fail to create ${d.name} role, skipped`)
    }
  }));
}

async function seedUsers() {
  const data: Prisma.UserCreateInput[] = [
    {username: 'khairul', Password: {create: { hash: await bcrypt.hash("Password12", 10) }}, role: {connectOrCreate: {where: {name: 'guest'}, create: {name: 'guest'}}}},
    {username: 'admin', Password: {create: { hash: await bcrypt.hash("Password12", 10) }}, role: {connectOrCreate: {where: {name: 'admin'}, create: {name: 'admin'}}}},
  ]

  await Promise.all(data.map(async (d) => {
    try {
      await prisma.user.create({
        data: d,
      });
      console.log(`successfully created ${d.username}`)
    } catch {
      console.log(`fail to create ${d.username}, skipped`)
    }
  }));
}

async function seedSuppliers() {
  const data: Prisma.SupplierCreateInput[] = []

  for(let i = 0; i < 3; i++) {
    const supplier = {
      name: faker.company.name()
    }
    data.push(supplier)
  }

  await Promise.all(data.map(async (d) => {
    try {
      await prisma.supplier.create({
        data: d,
      });
      console.log(`successfully created ${d.name}`)
    } catch {
      console.log(`fail to create ${d.name}, skipped`)
    }
  }));
}

async function seedProductsAndInventories() {
  const products: Prisma.ProductCreateInput[] = []
  for(let i = 0; i < 30; i++) {
    const product: Prisma.ProductCreateInput = {
      name: faker.commerce.productName(),
      price: Number(faker.commerce.price()),
      supplier: {
        connectOrCreate: {
          where: {id: 1},
          create: {
            name: 'Supplier1'
          }
        }
      },
      user: {
        connectOrCreate: {
          where: {username: 'admin'},
          create: {username: 'admin'}
        }
      },
      inventory: {
        create: {quantity: Math.ceil(Math.random()*200)}
      }
    }
    products.push(product)
  }

  await Promise.all(products.map(async (d) => {
    try {
      await prisma.product.create({
        data: d,
      });
      console.log(`successfully created ${d.name}`)
    } catch {
      console.log(`fail to create ${d.name}, skipped`)
    }
  }));
}
