# Deployment — serving this app at `skale.dev/pdf-editor`

This app runs in its **own Vercel project** (`pdf-editor-rouge-psi.vercel.app`,
auto-deployed from `main`) but is served **transparently** at
`skale.dev/pdf-editor` by the **skalego** project, which reverse-proxies the
request via a `vercel.json` rewrite. The visitor's address bar stays on
`skale.dev/pdf-editor`.

For the full, framework-agnostic guide (incl. the skalego side and the
Vite-vs-Next.js difference) see **`skalego/APPS.md`**.

## What makes it work in *this* repo

### 1. Vite `base` = the subpath (`vite.config.ts`)
```ts
export default defineConfig({
  base: '/pdf-editor/',
  // ...
});
```
All asset, worker (`pdf.worker.min.mjs`), and lazy-chunk (`es-*.js`, pdf-lib)
URLs are emitted as `/pdf-editor/...`. Without this, the browser would request
`skale.dev/assets/...` (root) and 404 — the #1 reason a subpath proxy "almost
works" (page loads, assets don't).

### 2. Self-rewrite so the app's own domain still works (`vercel.json`)
```json
{
  "rewrites": [{ "source": "/pdf-editor/:path*", "destination": "/:path*" }]
}
```
Vite's `base` only rewrites URLs in `index.html` — the files still live at the
project root (`/assets/...`). This rule lets `pdf-editor-rouge-psi.vercel.app/`
serve correctly too (its HTML references `/pdf-editor/assets/...`, which this
maps back to `/assets/...`). Vercel preview deployments keep working.

## The proxy side (skalego repo — not here)
`skalego/vercel.json` **strips** the prefix (because Vite serves files at root):
```jsonc
{ "source": "/pdf-editor",        "destination": "https://pdf-editor-rouge-psi.vercel.app/" },
{ "source": "/pdf-editor/:path*", "destination": "https://pdf-editor-rouge-psi.vercel.app/:path*" }
```

## Deploy order
1. Push **this** repo (app gets `base:'/pdf-editor/'` + self-rewrite) → wait Ready.
2. Push **skalego** (rewrite points at the app).

Flipping skalego before the app is ready → broken assets until the app deploys.

## Verify (URL must stay `skale.dev/pdf-editor` — that's the proxy)
```bash
curl -sI https://www.skale.dev/pdf-editor | grep -iE 'HTTP|content-type'
# main bundle, worker, lazy chunk all proxy through:
curl -sI https://www.skale.dev/pdf-editor/assets/pdf.worker.min-*.mjs | grep -i content-type
# own domain still works:
curl -sI https://pdf-editor-rouge-psi.vercel.app/
```

## TL;DR gotchas
- `base:'/pdf-editor/'` is mandatory — no base ⇒ asset 404s.
- Use `/:path*` and match the exact `/pdf-editor`; mind trailing slashes.
- Deploy the app before the skalego rewrite.
