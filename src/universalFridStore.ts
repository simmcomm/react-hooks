import { createInMemoryFridStore, createWebStorageFridStore, type FridStore } from '@simmcomm/internal-agency-client';

export function createUniversalFridStore(storage?: Storage, key?: string): FridStore {
  return typeof window !== 'undefined' ? createWebStorageFridStore(storage, key) : createInMemoryFridStore();
}
