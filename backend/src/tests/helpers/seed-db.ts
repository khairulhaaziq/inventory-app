import bcrypt from 'bcrypt';
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seed() {
  await seedUsers()
  const suppliers = await seedSuppliers()
  await seedProductsAndInventories(suppliers.map(i=>i?.id))
  console.log(`Database has been seeded. 🌱`);
}

async function seedUsers() {
  const data: Prisma.UserCreateInput[] = [
    {username: 'ahmad', Password: {create: { hash: await bcrypt.hash("Password12", 10) }}},
    {username: 'khairul', Password: {create: { hash: await bcrypt.hash("Password12", 10) }}},
    {username: 'haaziq', Password: {create: { hash: await bcrypt.hash("Password123", 10) }}},
    {username: 'haaziq2', Password: {create: { hash: await bcrypt.hash("Password123", 10) }}},
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
  const data: Prisma.SupplierCreateInput[] = [
    {name: 'Supplier1'},
    {name: 'Supplier2'},
    {name: 'Supplier3'},
  ]

  const newSuppliers = await Promise.all(data.map(async (d) => {
    try {
      const newSupplier = await prisma.supplier.create({
        data: d,
      });
      console.log(`successfully created ${d.name}`)
      return newSupplier
    } catch {
      console.log(`fail to create ${d.name}, skipped`)
    }
  }));

  return newSuppliers
}

async function seedProductsAndInventories(ids: (number | undefined)[]) {
  const data: Prisma.ProductCreateInput[] = [
    {name: 'Product1', price: 18.99, supplier: {connect: {id: ids[0]}}, user: {connect: { username: 'ahmad'}}, inventory: {create: {quantity: 5}}},
    {name: 'Product2', price: 12.85, supplier: {connect: {id: ids[1]}}, user: {connect: { username: 'khairul'}}, inventory: {create: {quantity: 7}}},
    {name: 'Product3', price: 14.60, supplier: {connect: {id: ids[2]}}, user: {connect: { username: 'haaziq'}}, inventory: {create: {quantity: 2}}},
  ]

  try {
    await prisma.product.create({
      data: data[0],
    });
    console.log(`successfully created ${data[0].name}`)
  } catch(e) {
    console.log(`fail to create ${data[0].name}, skipped, error: ${e}`)
  }
}
