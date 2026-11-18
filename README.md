# Kiln & Kettle

A tiny demo store used to show [Proof](https://github.com/crypticsaiyan/proof) catching, reproducing and fixing real bugs with Kane CLI.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test
```

Cart lives in a cookie; prices are integer cents; `src/index.js` is the Vercel entrypoint and `src/dev.js` the local server.
`proof.config.json` tells Proof how to start the app and which paths are hash-locked. `tests/regressions/` holds Kane `_test.md` regression tests.
