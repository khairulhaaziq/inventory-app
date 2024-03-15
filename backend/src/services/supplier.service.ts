import prisma from '../libs/prisma';
import type { Prisma } from '@prisma/client';
import type { SupplierSearch } from '../types/supplier.types';

const findSuppliers = (searchParams: SupplierSearch) => {
  return prisma.$transaction([
    prisma.supplier.findMany({
      take: searchParams.limit,
      skip: searchParams.page ? (searchParams.page * (searchParams.limit || 25)) - (searchParams.limit || 25) : 0,
    }),
    prisma.supplier.count()
  ])
};

const findSupplier = (id: number) => {
  return prisma.supplier.findFirst({
    where: {
      id: id
    },
  });
};

const createSupplier = (newSupplier: Prisma.SupplierCreateInput) => {
  return prisma.supplier.create({data: newSupplier});
};

const updateSupplier = (id: number, updatedSupplier: Prisma.SupplierUpdateInput) => {
  return prisma.supplier.update({where: {
    id: id
  }, data: updatedSupplier});
};

const deleteSupplier = (id: number) => {
  return prisma.supplier.delete({
    where: {
      id: id
    }
  });
};

export const supplierService = {
  findSuppliers,
  findSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
}
