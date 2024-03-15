import type { z } from 'zod';
import type { inventoryValidator } from '../validators/inventory.validator';

export interface InventorySearch {
  page?: number;
  limit?: number;

  sort?: 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc' | 'qtyAsc' | 'qtyDesc' | string;
  name?: string;
}

export type InventoryCreate = z.infer<typeof inventoryValidator.createInventorySchema>
export type InventoryUpdate = z.infer<typeof inventoryValidator.updateInventorySchema>
export type InventoryDelete = z.infer<typeof inventoryValidator.deleteInventorySchema>
