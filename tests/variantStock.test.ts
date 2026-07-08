import assert from 'node:assert/strict';
import { LocalProductAdapter, LocalSaleAdapter } from '../src/infrastructure/localAdapters.ts';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  setItem(key: string, value: string) { this.store.set(key, value); }
  removeItem(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

const storage = new MemoryStorage();
(globalThis as any).localStorage = storage;

const run = async () => {
  await LocalProductAdapter.save({
    id: 'PROD-TEST',
    name: 'Producto test',
    category: { id: 1, name: 'General' },
    normalPrice: 100,
    wholesalePrice: 80,
    variants: [
      { id: 'VAR-1', sku: 'SKU-1', attributeList: [{ key: 'Talla', value: 'M' }], stock: 5 },
      { id: 'VAR-2', sku: 'SKU-2', attributeList: [{ key: 'Talla', value: 'S' }], stock: 3 }
    ]
  });

  const sale = await LocalSaleAdapter.register({
    clientName: 'Cliente',
    items: [{ productId: 'PROD-TEST', variantId: 'VAR-1', quantity: 2, unitPrice: 100 }]
  });

  const afterSale = await LocalProductAdapter.findById('PROD-TEST');
  assert.equal(afterSale.variants.find((v: any) => v.id === 'VAR-1')?.stock, 3);
  assert.equal(afterSale.variants.find((v: any) => v.id === 'VAR-2')?.stock, 3);

  await LocalSaleAdapter.revert(sale.id);

  const afterRevert = await LocalProductAdapter.findById('PROD-TEST');
  assert.equal(afterRevert.variants.find((v: any) => v.id === 'VAR-1')?.stock, 5);
  assert.equal(afterRevert.variants.find((v: any) => v.id === 'VAR-2')?.stock, 3);
};

run().then(() => {
  console.log('variantStock test passed');
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
