import { getProduct } from './catalog.js';

export const COUPONS = {
  SAVE10: { kind: 'percent', value: 10, label: '10% off your order' },
  WELCOME20: { kind: 'fixed', value: 2000, label: '$20 off your first order' },
};

export const FREE_SHIPPING_OVER = 5000;
export const SHIPPING = 599;

export function couponFor(code) {
  return COUPONS[String(code ?? '').trim().toUpperCase()];
}

/** Price a cart: { items: [{ id, qty }], coupons: [code] } -> totals in cents. */
export function priceCart(cart) {
  const lines = [];
  for (const { id, qty } of cart.items) {
    const product = getProduct(id);
    if (!product || qty < 1) continue;
    lines.push({ ...product, qty, lineTotal: product.price * qty });
  }
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  let discount = 0;
  for (const code of cart.coupons) {
    const coupon = couponFor(code);
    if (!coupon) continue;
    if (coupon.kind === 'percent') {
      discount += Math.round((subtotal * coupon.value) / 100);
    } else {
      discount += coupon.value;
    }
  }

  discount = Math.min(discount, subtotal);

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING;
  const total = subtotal - discount + shipping;
  return { lines, subtotal, discount, shipping, total };
}
