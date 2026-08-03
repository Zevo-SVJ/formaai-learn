# Sharing a test build

## Why the Lovable preview link cannot be sent to testers

The project has a preview host, and it is real:

```
https://id-preview-23442503--ff20e900-72ee-46ea-af34-54249137d40e.lovable.app
```

It resolves, and it answers — with a `302` to
`lovable.dev/auth-bridge?project_id=…`. It is the editor's preview, gated behind
a Lovable session, so anyone without access to the project hits a login wall
rather than Forma. Verified, not assumed:

```bash
curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' \
  https://id-preview-23442503--ff20e900-72ee-46ea-af34-54249137d40e.lovable.app/
```

So a shareable link has to be a published deployment of its own.

## What was tried, and where each route ends

Run rather than reasoned about. Every line below is a command that was executed.

**The npm cache is not a blocker.** `~/.npm` on this machine holds root-owned
files, so `npx` and `npm install` die with `EACCES`. It does not need a
password to work around - npm takes a cache directory, and a project-local one
is writable:

```bash
npm_config_cache=node_modules/.cache/npm npx --yes wrangler@latest --version   # 4.118.0
```

**A Cloudflare account is not strictly needed to authenticate.** `wrangler
deploy --temporary` runs on a throwaway account and prints a claim URL. It
authenticates, and it uploaded all 79 assets.

**But it cannot host this app.** A temporary or free account caps a Worker at
1 MiB. Forma's server bundle is about 5 MiB - TanStack Router, recharts,
framer-motion, the AI SDK and Supabase auth are the five largest pieces, and
none of them is optional:

```
✘ Your Worker exceeded the size limit of 1 MiB.
  Please upgrade to a paid plan to deploy Workers up to 10 MiB.
```

Production works because Lovable's Cloudflare account is on a paid plan. So the
deployment needs an account with that plan - there is no way around the limit
that does not mean shipping less than the whole app.

## Right now, for a live session: a tunnel

No account, no deploy, no waiting. It puts the running dev server on a public
address:

```bash
npm run preview:tunnel
```

It prints an `https://….trycloudflare.com` URL that anyone can open — the whole
app, sign-up included. `vite.config.ts` allows that domain by suffix, because
the hostname is different on every tunnel.

The trade is honest: the link lives only while the dev server and the tunnel are
running on this machine. Close the terminal, or let the Mac sleep, and it stops
answering. It is right for a testing session with people you can talk to, and
wrong for a link you send and forget.

Checked before recommending it: the dev server refuses `.env` and `.git` with
403, so nothing secret is reachable. Source files are served, as on any dev
server — the same code the client bundle already ships.

## For a link that survives: deploying it

```bash
npm run preview:deploy
```

One command, and it needs a Cloudflare login on an account with the Workers
paid plan. It ships the same build under the worker name `forma-preview`: a
different name is a different Worker, with its own URL and its own lifecycle,
so `zevo-svj-formaai-learn` - production - is neither read nor written.

The URL it prints is the one to send:

```
https://forma-preview.<subdomain>.workers.dev
```

The subdomain is fixed per Cloudflare account, so from the second deploy onward
the address never changes and the same link keeps working.

The compatibility date is pinned to 2026-08-01 on purpose: the generated config
uses the build date, and Cloudflare rejects a date it considers to be in the
future.

## What testers get

The whole application, against the same Supabase project as production: they
sign up for real, upload a real lesson, get real cards, quizzes and grades.
Accounts and documents created there are the same accounts and documents — this
is a second front end, not a second database.

## Why it cannot be indexed

Anything that is not the production host is treated as a preview, so this
deployment answers `Disallow: /` on robots.txt and sets `X-Robots-Tag: noindex,
nofollow` on every response. It cannot compete with production in search, and
it needs no configuration to be safe — the protection keys off the host, so it
applies the moment the URL exists.

## A cleaner address

`forma.ai` is registered and in use by somebody else (A `3.160.188.39`, on AWS
Route 53), as is `getforma.ai`. Any custom domain means buying one and pointing
DNS at the preview Worker, which is a purchase rather than a code change. The
`workers.dev` URL needs neither.
