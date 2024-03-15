import type { ProductSearch } from '../types/product.types';
import prisma from '../libs/prisma';
import type { Prisma } from '@prisma/client';

const findProducts = (searchParams: ProductSearch) => {
  return prisma.$transaction([
    prisma.product.findMany({
      take: searchParams.limit,
      skip: searchParams.page ? (searchParams.page * (searchParams.limit || 25)) - (searchParams.limit || 25) : 0,
      include: {
        supplier: true,
        inventory: true,
      },
    }),
    prisma.product.count()
  ])
};

const findProduct = (id: number) => {
  return prisma.product.findFirst({
    where: {
      id: id
    },
    include: {
      supplier: true,
      inventory: true,
    },
  });
};

const createProduct = (newProduct: Prisma.ProductCreateInput) => {
  return prisma.product.create({data: newProduct});
};

const updateProduct = (id: number, updatedProduct: Prisma.ProductUpdateInput) => {
  return prisma.product.update({where: {
    id: id
  }, data: updatedProduct});
};

const deleteProduct = (id: number) => {
  return prisma.product.delete({
    where: {
      id: id
    }
  });
};

export const productService = {
  findProducts,
  findProduct,
  createProduct,
  updateProduct,
  deleteProduct,
}
