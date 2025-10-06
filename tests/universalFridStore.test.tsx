import { createUniversalFridStore } from '../src';
import { createInMemoryFridStore, createWebStorageFridStore } from '@simmcomm/internal-agency-client';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@simmcomm/internal-agency-client', () => ({
  createInMemoryFridStore: vi.fn(),
  createWebStorageFridStore: vi.fn(),
}));

describe('createUniversalFridStore', () => {
  it('uses createWebStorageFridStore in a browser environment', () => {
    global.window = {} as any; // Mock window object
    createUniversalFridStore(localStorage, 'test-key');
    expect(createWebStorageFridStore).toHaveBeenCalledWith(localStorage, 'test-key');
  });

  it('uses createInMemoryFridStore in a non-browser environment', () => {
    delete (global as any).window; // Remove window object
    createUniversalFridStore();
    expect(createInMemoryFridStore).toHaveBeenCalled();
  });
});
