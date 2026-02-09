# SWANKK Monorepo

## Structure
```
webapp/                          (repo root — npm workspaces)
├── package.json                 (workspace root: "packages/*")
├── schema.sql                   (shared D1 schema)
├── scripts/setup.js             (first-time infra setup)
├── packages/
│   ├── web/                     (@swankk/web — main consumer app)
│   │   ├── src/                 (React 18 + Tailwind + React Router + React Query)
│   │   ├── functions/           (Cloudflare Pages Functions — serverless API)
│   │   ├── wrangler.toml        (project: "swankk")
│   │   └── ...                  (vite, tailwind, postcss, eslint configs)
│   └── admin/                   (@swankk/admin — MUI-based admin panel)
│       ├── src/                 (React 18 + MUI 6 + React Router + React Query)
│       ├── functions/           (shares _middleware, admin API endpoints)
│       ├── wrangler.toml        (project: "swankk-admin")
│       └── ...
```

## Commands
```bash
npm run dev:web          # vite dev server for web
npm run dev:admin        # vite dev server for admin
npm run dev:web:full     # wrangler pages dev (with D1 + R2) for web
npm run dev:admin:full   # wrangler pages dev (with D1 + R2) for admin
npm run build:web        # vite build web
npm run build:admin      # vite build admin
npm run build            # build both
npm run deploy:web       # wrangler pages deploy web (build first)
npm run deploy:admin     # wrangler pages deploy admin (build first)
npm run deploy           # build + deploy both
```

## Infrastructure
- **Hosting**: Cloudflare Pages (GitHub integration auto-deploys on push to main)
- **Database**: Cloudflare D1 (SQLite) — binding `DB`, database `swankk-db`, id `b2a73d0c-36a1-49a5-a70c-c5b46c917c96`
- **Storage**: Cloudflare R2 — binding `ASSETS_BUCKET`, bucket `swankk-assets`
- **Both projects share** the same D1 database and R2 bucket
- **R2 asset uploads**: `POST /api/admin/upload` (FormData with `file` + `folder`), served at `GET /api/assets/{key}` in both packages

## Cloudflare Pages Projects
| Project | Build command | Output dir |
|---|---|---|
| `swankk` (web) | `npm run build:web` | `packages/web/dist` |
| `swankk-admin` | `npm run build:admin` | `packages/admin/dist` |

## Auth System
- **Access gate**: `SITE_SECRET` env var — first visit via `?access=<secret>` sets `swankk_gate` cookie
- **JWT sessions**: `SWANKK_JWT_SECRET` — `swankk_session` cookie, HMAC-SHA256
- **Middleware**: `functions/_middleware.js` in both packages handles gate + JWT verification
- Both projects need the same `SITE_SECRET` and `SWANKK_JWT_SECRET` secrets set in Cloudflare

## Tech Stack
- **web**: React 18, Vite, Tailwind CSS, React Router, React Query, Framer Motion, Lucide icons
- **admin**: React 18, Vite, MUI 6, React Router, React Query
- **backend**: Cloudflare Pages Functions (file-based routing under `functions/`)
- **`@` alias** resolves to `./src` in both packages (vite config)

## Conventions
- Package scripts do one thing (build and deploy are separate)
- `functions/` uses Cloudflare Pages file-based routing (`onRequestGet`, `onRequestPost`, etc.)
- Admin API endpoints live under `functions/api/admin/`
- Asset serving endpoints at `functions/api/assets/[[path]].js` (catch-all) in both packages
- SQL queries go through `context.env.DB.prepare()` (D1 binding)
- R2 uploads go through `context.env.ASSETS_BUCKET.put()` / `.get()`

## Dev Notes
- **wrangler 4.63+**: The `-- command` proxy syntax is deprecated. Use `--proxy=PORT` instead (run vite on a port, then `wrangler pages dev --proxy=PORT --d1=DB --r2=ASSETS_BUCKET`)
- The `dev:full` scripts in package.json may need updating if wrangler drops the deprecated syntax entirely
