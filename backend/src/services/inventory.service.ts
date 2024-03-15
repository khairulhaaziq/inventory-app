import type { InventoryCreate, InventorySearch, InventoryUpdate } from '../types/inventory.types';
import prisma from '../libs/prisma';
import type { Prisma } from '@prisma/client';

const findInventories = (searchParams: InventorySearch) => {
  const query: Prisma.ProductInventoryFindManyArgs = {
    where: {
      product: {
        name: {
          contains: searchParams.name,
          mode: 'insensitive'
        }
      }
    }
  };
  let sort: Prisma.ProductInventoryFindManyArgs = {orderBy: {id: 'desc'}}
  if (searchParams.sort && searchParams.sort === 'idAsc') {
    sort = {orderBy: {id: 'asc'}}
  }
  if (!searchParams.sort || searchParams.sort === 'idDesc') {
    sort = {orderBy: {id: 'desc'}}
  }
  if (searchParams.sort && searchParams.sort === 'priceAsc' || searchParams.sort === 'priceDesc') {
    sort = {orderBy: {product: {price: (searchParams.sort === 'priceAsc' ? 'asc' : searchParams.sort === 'priceDesc' ? 'desc' : undefined),}}}
  }
  if (searchParams.sort && searchParams.sort === 'nameAsc' || searchParams.sort === 'nameDesc') {
    sort = {orderBy: {product: {name: (searchParams.sort === 'nameAsc' ? 'asc' : searchParams.sort === 'nameDesc' ? 'desc' : undefined),}}}
  }
  if (searchParams.sort && searchParams.sort === 'qtyAsc' || searchParams.sort === 'qtyDesc') {
    sort = {orderBy: {quantity: (searchParams.sort === 'qtyAsc' ? 'asc' : searchParams.sort === 'qtyDesc' ? 'desc' : undefined),}}
  }
  return prisma.$transaction([
    prisma.productInventory.findMany({
      ...query,
      take: searchParams.limit,
      skip: searchParams.page ? (searchParams.page * (searchParams.limit || 25)) - (searchParams.limit || 25) : 0,
      include: {
        product: {
          include: {
            supplier: true
          }
        },
      },
      orderBy: sort.orderBy
    }),
    prisma.productInventory.count({where: query.where})
  ])
};

const findInventory = (id: number) => {
  return prisma.productInventory.findFirst({
    where: {
      productId: id
    },
    include: {
      product: {
        include: {
          supplier: true
        }
      },
    },
  });
};

const createInventory = (newInventory: InventoryCreate, userId?: string) => {
  return prisma.productInventory.create({data: {
    product: {
      create: {
        name: newInventory.product.name,
        price: Number(newInventory.product.price.toFixed(2)),
        userId: userId
      }
    },
    quantity: newInventory.quantity
  }});
};

const updateInventory = (updatedInventory: InventoryUpdate) => {
  return prisma.productInventory.update({where: {
    productId: updatedInventory.productId
  }, data: {
    product: {
      update: {
        name: updatedInventory.product.name,
        price: Number(updatedInventory.product.price.toFixed(2)),
      }
    },
    quantity: updatedInventory.quantity
  }});
};

const deleteInventory = (productId: number) => {
  return prisma.product.delete({
    where: {
      id: productId
    }
  });
};

export const inventoryService = {
  findInventories,
  findInventory,
  createInventory,
  updateInventory,
  deleteInventory,
}
