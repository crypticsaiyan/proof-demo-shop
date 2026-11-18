// Product catalog. Prices are integer cents.

export const PRODUCTS = [
  {
    id: 'stoneware-mug',
    name: 'Stoneware Mug',
    blurb: 'Hand-thrown, speckled glaze, 350 ml.',
    price: 2400,
    color: '#c9a27e',
  },
  {
    id: 'pour-over-kettle',
    name: 'Pour-over Kettle',
    blurb: 'Gooseneck spout, 0.9 L, brushed steel.',
    price: 6800,
    color: '#8d9aa5',
  },
  {
    id: 'tea-tin',
    name: 'Tea Tin',
    blurb: 'Airtight double lid. Keeps 100 g of leaves fresh.',
    price: 1200,
    compareAt: 1800,
    color: '#6f8f72',
  },
  {
    id: 'ceramic-dripper',
    name: 'Ceramic Dripper',
    blurb: 'Spiral ribs for an even extraction.',
    price: 1600,
    compareAt: 2200,
    color: '#e3d5c3',
  },
  {
    id: 'linen-napkins',
    name: 'Linen Napkins',
    blurb: 'Set of four, stonewashed.',
    price: 3000,
    color: '#b8a089',
  },
  {
    id: 'matcha-whisk',
    name: 'Matcha Whisk',
    blurb: 'Bamboo chasen, 100 prongs.',
    price: 1400,
    color: '#9fb36b',
  },
];

const byId = new Map(PRODUCTS.map((p) => [p.id, p]));

export function getProduct(id) {
  return byId.get(id);
}

export function money(cents) {
  const sign = cents < 0 ? '-' : '';
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}
