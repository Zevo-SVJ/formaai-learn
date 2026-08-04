# Moving the site to Vercel

## What this is not

Moving off Lovable is not a change of hostname. Three things in this codebase
are Lovable services, and two of them are the product:

| What | Where | Survives a move? |
| --- | --- | --- |
| **AI gateway** | `ai.gateway.lovable.dev`, `LOVABLE_API_KEY` | **Unknown.** Every explanation, card and quiz goes through it. |
| **OAuth broker** | `@lovable.dev/cloud-auth-js` | **Unknown.** Google and Apple sign-in are brokered by Lovable. |
| Build config | `@lovable.dev/vite-tanstack-config` | Yes — it is a normal Vite config. |

The gateway is reached with a key from `process.env`, so it *may* answer from
anywhere. Whether Lovable permits that, and whether it stays billed to the
account, is a question for Lovable rather than for the code. Nothing here can
answer it, and it is the one thing that decides whether the migration works:
if the gateway refuses, the site loads and does nothing.

**Test this before switching any DNS or telling anyone the address changed.**
Deploy to Vercel, sign in, and analyse one lesson. If the analysis returns, the
migration is real; if it does not, the AI provider has to be replaced first.

## The origin is configuration now

`src/lib/site.ts` resolves it in this order:

1. `VITE_SITE_URL` — set deliberately. **This is the one to change for a custom
   domain**, and it beats everything else.
2. `VITE_VERCEL_PROJECT_PRODUCTION_URL` — Vercel's own stable production domain,
   so a fresh deployment canonicalises correctly before any variable is set.
3. A fallback constant.

Canonical tags, `og:url`, the sitemap, robots.txt, the JSON-LD graph and the
social image URL all read from it. Buying a domain later is one variable and a
rebuild — no file in `src/` is touched, which is the point.

## Frontend on Vercel, AI still on Lovable

The split asked for - "frontend on Vercel, backend on Lovable" - cannot be done
by moving files, because this is not a frontend plus an API. It is one TanStack
Start application:

- **Server functions are not URLs.** `analyzeDocument` and the rest are
  `createServerFn`; the compiler turns them into RPC against `/_serverFn/<id>`
  on the same origin. The client never calls an address anyone can redirect.
- **Pages are server-rendered.** The landing, the legal pages, robots.txt and
  sitemap.xml produce their HTML on a server, so "frontend on Vercel" means
  Vercel runs a server, not that it serves files.

So the app is not split. It is deployed whole to Vercel, and the two paths that
need `LOVABLE_API_KEY` are proxied back to the Lovable deployment, which still
has it:

```
browser → the Vercel domain          one origin, start to finish
   ├── pages, SSR, SEO, auth, library     → Vercel
   ├── /api/chat            ──rewrite──→  Lovable
   └── /_serverFn/:fn*      ──rewrite──→  Lovable
```

A Vercel rewrite is a server-side proxy, which is what makes this work at all:
the browser never sees the Lovable address, never makes a cross-origin request,
so there is no CORS to configure — and no Lovable secret ever leaves Lovable.

`/api/chat` reads the session from an `Authorization: Bearer` header, and a
rewrite forwards headers unchanged, so Supabase auth crosses the proxy intact.
Both deployments talk to the same Supabase project; there is nothing to keep in
step between them.

### What this costs

**Lovable stays deployed and stays paid.** This buys the address, not
independence. It is a dependency made invisible, not removed.

**The chat streams through two hosts.** Rewrites support streaming, but the
extra hop adds latency and one more place a long generation can time out.
**Test a full tutor reply first** - it is the part most likely to disappoint.

**`/_serverFn` is TanStack's internal path, not a public contract.** If a future
version renames it the rewrite stops matching, and the failure is quiet: the
analysis would break with no obvious cause. Check this path after any TanStack
upgrade.

**All server functions are proxied, not only the one that needs the key.** They
share a single endpoint and are told apart by an id inside the request, so
routing them selectively by path is not possible. Referral and grades calls take
the extra hop for nothing.

The simpler shape remains: get `LOVABLE_API_KEY` from Lovable support and drop
the rewrites entirely. That removes the streaming hop, the fragile path and the
second deployment in one go.

## Deploying

Nitro detects Vercel on its own and emits `.vercel/output` in Build Output API
format. Verified locally with `VERCEL=1 npm run build`; no preset or adapter
configuration is needed, and `vercel.json` only pins the build command and the
region.

Environment variables to set in the Vercel project — the same values the Lovable
deployment uses:

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY     # server only, never exposed to the client
LOVABLE_API_KEY               # server only — the AI gateway
VITE_SITE_URL                 # https://<the-vercel-domain>
```

## Supabase, after the domain changes

Supabase rejects an OAuth redirect to a URL it has not been told about, so
sign-in breaks silently until this is done. In the dashboard, Authentication →
URL Configuration:

- **Site URL** → the new origin
- **Redirect URLs** → add the new origin and `/*` under it

Leave the Lovable entries in place until the old address is retired; two allowed
origins cost nothing and prevent a window where neither works.

## Keeping search rankings

The old address has been indexed. Search Console treats a host change as a
migration, and it needs the two hosts connected:

1. Verify the new domain in Search Console and submit `sitemap.xml`.
2. Keep `getforma-ai.lovable.app` alive and make it **301** to the new origin.
   A redirect is what passes ranking; deleting the old deployment throws it
   away.
3. Use the Change of Address tool once the redirect is live.

Do not run both hosts serving the same pages without a redirect: that is the
duplicate-content situation the whole `isProductionHost` guard exists to avoid,
and here it would be self-inflicted.

## Names

`forma.vercel.app`, `forma-ai.vercel.app`, `forma-app.vercel.app`,
`tryforma.vercel.app` and `formaai.vercel.app` all answer already — they belong
to other projects. `getforma-ai.vercel.app` is free and keeps the name the
current address already uses.
