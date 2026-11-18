import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addItem, applyCoupon } from '../src/cart.js';
import { money } from '../src/catalog.js';
import { priceCart, SHIPPING } from '../src/pricing.js';

test('subtotal and shipping', () => {
  const p = priceCart({ items: [{ id: 'stoneware-mug', qty: 2 }], coupons: [] });
  assert.equal(p.subtotal, 4800);
  assert.equal(p.shipping, SHIPPING);
  assert.equal(p.total, 4800 + SHIPPING);
});

test('free shipping over $50', () => {
  const p = priceCart({ items: [{ id: 'pour-over-kettle', qty: 1 }], coupons: [] });
  assert.equal(p.shipping, 0);
  assert.equal(p.total, 6800);
});

test('percent coupon', () => {
  const p = priceCart({ items: [{ id: 'pour-over-kettle', qty: 1 }], coupons: ['SAVE10'] });
  assert.equal(p.discount, 680);
  assert.equal(p.total, 6120);
});

test('fixed coupon', () => {
  const p = priceCart({ items: [{ id: 'pour-over-kettle', qty: 1 }], coupons: ['WELCOME20'] });
  assert.equal(p.total, 4800);
});

test('cart helpers', () => {
  const cart = { items: [], coupons: [] };
  addItem(cart, 'tea-tin');
  addItem(cart, 'tea-tin');
  assert.deepEqual(cart.items, [{ id: 'tea-tin', qty: 2 }]);
  assert.equal(applyCoupon(cart, 'nope'), '"nope" is not a valid code.');
  assert.equal(applyCoupon(cart, 'save10'), null);
  assert.deepEqual(cart.coupons, ['SAVE10']);
});

test('money formatting', () => {
  assert.equal(money(1234), '$12.34');
  assert.equal(money(-201), '-$2.01');
});
