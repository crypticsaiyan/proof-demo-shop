import { html, raw } from 'hono/html';
import { money, PRODUCTS } from './catalog.js';
import { couponFor, FREE_SHIPPING_OVER } from './pricing.js';

const CSS = `
:root { --ink:#2a2420; --muted:#7a6f66; --line:#e8dfd4; --bg:#faf6f0; --card:#fff; --accent:#b4532a; --ok:#3f7a4a; --err:#b42a2a; }
* { box-sizing: border-box; }
body { margin:0; font: 16px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; color:var(--ink); background:var(--bg); }
a { color: inherit; }
header.top { display:flex; align-items:center; justify-content:space-between; padding:18px 28px; border-bottom:1px solid var(--line); background:var(--card); }
header.top .brand { font-weight:700; letter-spacing:.02em; text-decoration:none; font-size:20px; }
header.top nav a { margin-left:20px; text-decoration:none; color:var(--muted); }
header.top nav a.cart-link { color:var(--ink); font-weight:600; }
main { max-width:1040px; margin:0 auto; padding:28px; }
h1 { font-size:28px; margin:0 0 18px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:20px; }
.card { background:var(--card); border:1px solid var(--line); border-radius:14px; overflow:hidden; display:flex; flex-direction:column; }
.card .swatch { aspect-ratio: 4/3; display:grid; place-items:center; font-size:44px; color:#fff8; }
.card .body { padding:14px 16px 16px; display:flex; flex-direction:column; gap:6px; flex:1; }
.card .name { font-weight:600; text-decoration:none; }
.card .blurb { color:var(--muted); font-size:14px; flex:1; }
.price { font-weight:600; }
.price s { color:var(--muted); font-weight:400; margin-left:6px; }
.badge { display:inline-block; background:var(--accent); color:#fff; font-size:12px; padding:1px 8px; border-radius:99px; margin-left:6px; vertical-align:middle; }
button, .btn { font:inherit; border:0; border-radius:10px; padding:10px 16px; background:var(--ink); color:#fff; cursor:pointer; text-decoration:none; display:inline-block; text-align:center; }
button.secondary, .btn.secondary { background:transparent; color:var(--ink); border:1px solid var(--line); }
button.link { background:none; color:var(--muted); padding:0; text-decoration:underline; }
input { font:inherit; padding:9px 12px; border:1px solid var(--line); border-radius:10px; background:#fff; width:100%; }
.panel { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px 20px; }
.cart { display:grid; grid-template-columns: 1fr 340px; gap:24px; align-items:start; }
.line { display:grid; grid-template-columns: 56px 1fr auto auto; gap:14px; align-items:center; padding:12px 0; border-bottom:1px solid var(--line); }
.line:last-child { border-bottom:0; }
.line .thumb { width:56px; height:56px; border-radius:10px; }
.qty { display:flex; gap:6px; align-items:center; }
.qty input { width:64px; }
.totals div { display:flex; justify-content:space-between; padding:4px 0; }
.totals .grand { font-size:20px; font-weight:700; border-top:1px solid var(--line); margin-top:8px; padding-top:10px; }
.row { display:flex; gap:8px; }
.msg { padding:8px 12px; border-radius:10px; font-size:14px; margin:10px 0; }
.msg.err { background:#fbe9e9; color:var(--err); }
.msg.ok { background:#e9f4ea; color:var(--ok); }
.applied { display:flex; justify-content:space-between; font-size:14px; color:var(--ok); }
form.stack { display:grid; gap:12px; }
label { font-size:14px; color:var(--muted); display:grid; gap:4px; }
.promo-bar { display:none; }
@media (max-width: 760px) { .cart { grid-template-columns: 1fr; } main { padding:18px; } }
@media (max-width: 480px) {
  .promo-bar { display:flex; position:fixed; left:0; right:0; bottom:0; height:64px; z-index:20; align-items:center; justify-content:center; background:var(--accent); color:#fff; font-weight:600; font-size:14px; }
}
`;

export function layout({ title, cartCount = 0, body }) {
  const sdk = process.env.PROOF_SDK_URL
    ? html`<script src="${process.env.PROOF_SDK_URL}" data-project="${process.env.PROOF_PROJECT ?? 'kiln-and-kettle'}" defer></script>`
    : '';
  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">
<title>${title} · Kiln &amp; Kettle</title>
<style>${raw(CSS)}</style>
${sdk}
</head>
<body>
<header class="top">
  <a class="brand" href="/">Kiln &amp; Kettle</a>
  <nav><a href="/">Shop</a><a class="cart-link" href="/cart" data-testid="cart-link">Cart (${cartCount})</a></nav>
</header>
<main>${body}</main>
<div class="promo-bar">Free shipping on orders over ${money(FREE_SHIPPING_OVER)}</div>
</body>
</html>`;
}

function priceTag(p) {
  return p.compareAt
    ? html`<span class="price">${money(p.price)}<s>${money(p.compareAt)}</s><span class="badge">Sale</span></span>`
    : html`<span class="price">${money(p.price)}</span>`;
}

function addForm(p, label = 'Add to cart') {
  return html`<form method="post" action="/cart/add">
    <input type="hidden" name="id" value="${p.id}">
    <button type="submit" data-testid="add-${p.id}">${label}</button>
  </form>`;
}

export function home() {
  return html`<h1>Slow mornings, good cups.</h1>
<div class="grid">
${PRODUCTS.map(
  (p) => html`<div class="card">
  <a class="swatch" href="/product/${p.id}" style="background:${p.color}">◐</a>
  <div class="body">
    <a class="name" href="/product/${p.id}">${p.name}</a>
    <div class="blurb">${p.blurb}</div>
    ${priceTag(p)}
    ${addForm(p)}
  </div>
</div>`,
)}
</div>`;
}

export function productPage(p) {
  return html`<div class="cart">
  <div class="card"><div class="swatch" style="background:${p.color};aspect-ratio:1">◐</div></div>
  <div class="panel">
    <h1>${p.name}</h1>
    <p>${p.blurb}</p>
    <p>${priceTag(p)}</p>
    ${addForm(p)}
  </div>
</div>`;
}

export function cartPage({ priced, cart, error, notice }) {
  if (priced.lines.length === 0) {
    return html`<h1>Your cart</h1><div class="panel">Your cart is empty. <a href="/">Keep shopping</a>.</div>`;
  }
  return html`<h1>Your cart</h1>
<div class="cart">
  <div class="panel">
  ${priced.lines.map(
    (l) => html`<div class="line">
    <div class="thumb" style="background:${l.color}"></div>
    <div><a href="/product/${l.id}">${l.name}</a><div class="blurb">${money(l.price)} each</div></div>
    <form method="post" action="/cart/qty" class="qty">
      <input type="hidden" name="id" value="${l.id}">
      <input type="number" min="0" name="qty" value="${l.qty}" aria-label="Quantity for ${l.name}">
      <button class="secondary" type="submit">Update</button>
    </form>
    <div class="price" data-testid="line-total-${l.id}">${money(l.lineTotal)}</div>
  </div>`,
  )}
  </div>
  <div class="panel">
    <form method="post" action="/cart/coupon" class="row">
      <input name="code" placeholder="Discount code" aria-label="Discount code" data-testid="coupon-input">
      <button type="submit" data-testid="coupon-apply">Apply</button>
    </form>
    ${error ? html`<div class="msg err" role="alert">${error}</div>` : ''}
    ${notice ? html`<div class="msg ok" role="status">${notice}</div>` : ''}
    ${cart.coupons.map(
      (code) => html`<form method="post" action="/cart/coupon/remove" class="applied">
      <span>${code}: ${couponFor(code)?.label ?? ''}</span>
      <input type="hidden" name="code" value="${code}"><button class="link" type="submit">Remove</button>
    </form>`,
    )}
    ${totals(priced)}
    <a class="btn" href="/checkout" style="width:100%;margin-top:14px" data-testid="checkout">Checkout</a>
  </div>
</div>`;
}

function totals(priced) {
  return html`<div class="totals">
  <div><span>Subtotal</span><span data-testid="subtotal">${money(priced.subtotal)}</span></div>
  ${priced.discount ? html`<div><span>Discount</span><span data-testid="discount">-${money(priced.discount)}</span></div>` : ''}
  <div><span>Shipping</span><span data-testid="shipping">${priced.shipping ? money(priced.shipping) : 'Free'}</span></div>
  <div class="grand"><span>Total</span><span data-testid="total">${money(priced.total)}</span></div>
</div>`;
}

export function checkoutPage({ priced }) {
  if (priced.lines.length === 0) {
    return html`<h1>Checkout</h1><div class="panel">Your cart is empty. <a href="/">Keep shopping</a>.</div>`;
  }
  return html`<h1>Checkout</h1>
<div class="cart">
  <div class="panel">
    <form class="stack" id="checkout-form">
      <label>Full name <input name="name" required autocomplete="name" value="Ada Lovelace"></label>
      <label>Email for receipt <input name="email" type="email" required autocomplete="email" value="ada@example.com"></label>
      <label>Shipping address <input name="address" required autocomplete="street-address" value="12 Analytical Way, London"></label>
      <div id="checkout-error" class="msg err" role="alert" hidden></div>
      <button type="submit" id="place-order" data-testid="place-order">Place order · ${money(priced.total)}</button>
    </form>
  </div>
  <div class="panel">${totals(priced)}</div>
</div>
<script>
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('place-order');
  const errBox = document.getElementById('checkout-error');
  btn.disabled = true; errBox.hidden = true;
  const body = Object.fromEntries(new FormData(e.target));
  try {
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Checkout failed');
    location.href = '/order/' + data.orderId;
  } catch (err) {
    console.error('[checkout] failed:', err.message);
    errBox.textContent = 'Something went wrong placing your order. Please try again.';
    errBox.hidden = false; btn.disabled = false;
  }
});
</script>`;
}

export function orderPage(order) {
  if (!order) return html`<h1>Order not found</h1><div class="panel"><a href="/">Back to shop</a></div>`;
  return html`<h1>Thank you, ${order.name.split(' ')[0]}!</h1>
<div class="panel" data-testid="order-confirmation">
  <p>Order <strong>${order.id}</strong> is confirmed. A receipt is on its way to ${order.email}.</p>
  <p>Total charged: <strong data-testid="order-total">${money(order.total)}</strong></p>
  <a class="btn secondary" href="/">Continue shopping</a>
</div>`;
}
