// Cart lives in a cookie so the app stays stateless on serverless hosts.
import { getCookie, setCookie } from 'hono/cookie';
import { couponFor } from './pricing.js';

const COOKIE = 'kk_cart';

export function readCart(c) {
  try {
    const raw = getCookie(c, COOKIE);
    const cart = raw ? JSON.parse(decodeURIComponent(raw)) : null;
    if (cart && Array.isArray(cart.items) && Array.isArray(cart.coupons)) return cart;
  } catch {}
  return { items: [], coupons: [] };
}

export function writeCart(c, cart) {
  setCookie(c, COOKIE, encodeURIComponent(JSON.stringify(cart)), {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function addItem(cart, id, qty = 1) {
  const line = cart.items.find((i) => i.id === id);
  if (line) line.qty += qty;
  else cart.items.push({ id, qty });
}

export function setQty(cart, id, qty) {
  cart.items = cart.items.map((i) => (i.id === id ? { ...i, qty } : i)).filter((i) => i.qty > 0);
}

/** Returns an error message, or null when the coupon was applied. */
export function applyCoupon(cart, code) {
  const normalized = String(code ?? '').trim().toUpperCase();
  if (!couponFor(normalized)) return `"${code}" is not a valid code.`;
  cart.coupons.push(normalized);
  return null;
}

export function removeCoupon(cart, code) {
  cart.coupons = cart.coupons.filter((c) => c !== code);
}
