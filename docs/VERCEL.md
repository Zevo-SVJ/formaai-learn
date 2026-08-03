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
