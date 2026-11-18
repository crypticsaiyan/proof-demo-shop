import { Hono } from 'hono';
import { addItem, applyCoupon, readCart, removeCoupon, setQty, writeCart } from './cart.js';
import { getProduct } from './catalog.js';
import { charge } from './payments.js';
import { priceCart } from './pricing.js';
import { cartPage, checkoutPage, home, layout, orderPage, productPage } from './views.js';

const app = new Hono();
const orders = new Map();

const count = (cart) => cart.items.reduce((n, i) => n + i.qty, 0);
const page = (c, title, body) => c.html(layout({ title, cartCount: count(readCart(c)), body }));

app.get('/', (c) => page(c, 'Shop', home()));

app.get('/product/:id', (c) => {
  const p = getProduct(c.req.param('id'));
  return p ? page(c, p.name, productPage(p)) : c.notFound();
});

app.get('/cart', (c) => {
  const cart = readCart(c);
  const body = cartPage({ priced: priceCart(cart), cart, error: c.req.query('error'), notice: c.req.query('notice') });
  return page(c, 'Cart', body);
});

app.post('/cart/add', async (c) => {
  const form = await c.req.parseBody();
  const cart = readCart(c);
  if (getProduct(String(form.id))) addItem(cart, String(form.id));
  writeCart(c, cart);
  return c.redirect('/cart');
});

app.post('/cart/qty', async (c) => {
  const form = await c.req.parseBody();
  const cart = readCart(c);
  setQty(cart, String(form.id), Math.max(0, Number.parseInt(String(form.qty), 10) || 0));
  writeCart(c, cart);
  return c.redirect('/cart');
});

app.post('/cart/coupon', async (c) => {
  const form = await c.req.parseBody();
  const cart = readCart(c);
  const error = applyCoupon(cart, form.code);
  writeCart(c, cart);
  const q = error ? `error=${encodeURIComponent(error)}` : 'notice=Code%20applied';
  return c.redirect(`/cart?${q}`);
});

app.post('/cart/coupon/remove', async (c) => {
  const form = await c.req.parseBody();
  const cart = readCart(c);
  removeCoupon(cart, String(form.code));
  writeCart(c, cart);
  return c.redirect('/cart');
});

app.get('/checkout', (c) => page(c, 'Checkout', checkoutPage({ priced: priceCart(readCart(c)) })));

app.post('/api/checkout', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const cart = readCart(c);
  const priced = priceCart(cart);
  if (priced.lines.length === 0) return c.json({ error: 'Cart is empty' }, 400);
  try {
    const payment = charge({ amount: priced.total, email: body.email });
    const id = `KK-${payment.id.slice(3)}`;
    orders.set(id, { id, name: String(body.name || 'friend'), email: body.email, total: priced.total });
    writeCart(c, { items: [], coupons: [] });
    return c.json({ orderId: id });
  } catch (err) {
    console.error('[api/checkout]', err.message);
    return c.json({ error: 'Internal error' }, 500);
  }
});

app.get('/order/:id', (c) => page(c, 'Order confirmed', orderPage(orders.get(c.req.param('id')))));

app.get('/healthz', (c) => c.json({ ok: true }));

export default app;
