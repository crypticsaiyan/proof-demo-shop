// Local server. On Vercel, src/index.js is the entrypoint.
import { serve } from '@hono/node-server';
import app from './index.js';

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port }, () => console.log(`Kiln & Kettle on http://localhost:${port}`));
