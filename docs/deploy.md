# Deploy

Live at https://pulsefit.ali-moradi-develop.com (one VPS, Nginx on the host).
There is no backend: data lives in IndexedDB and the `/api/` routes are a mock
server inside the service worker (`src/app/sw/mock-server.ts`).

## How it runs

- `Dockerfile`: Node builds `dist/` (including `sw.js`) and gzips text files
  once. The final image holds only `dist/` and the Nginx config in
  `nginx-unprivileged` (uid 101, port 8080).
- `nginx/default.conf`:
  - `sw.js`, `index.html`, `offline.html`, `theme-init.js` and
    `manifest.webmanifest`: `no-cache`, so a new deploy is seen at once and the
    app's "New version available" prompt can appear.
  - `/assets/` (hashed): immutable for a year. `/data/`: one hour (the
    service worker refreshes it in the background). Icons and screenshots: a week.
  - `manifest.webmanifest` is sent as `application/manifest+json`.
  - `/api/` returns 404 from the server; only the service worker answers it.
  - Single-page app fallback, `gzip_static`, GET/HEAD only, `/healthz`.
- `nginx/security-headers.conf`: CSP (`script-src 'self'`, no inline scripts:
  the saved theme is applied by `public/theme-init.js`) and the other headers.
- `.github/workflows/docker.yml`: after CI passed on `main`, builds
  `ghcr.io/ali-moradi-design/pulsefit-web:<sha>`; deploy-kit's `deploy-app.yml`
  then makes the server pull it and restart (rolled back when not healthy) and
  checks a few paths through Nginx.
- `deploy/compose.yaml`: `/srv/apps/pulsefit/compose.yaml` on the server, port
  `127.0.0.1:3115`, read-only, 64 MB.
- `deploy/nginx.conf`: the host's site file (certbot adds TLS; a service worker
  needs HTTPS).

Always `nginx -t` before `systemctl reload nginx`.
