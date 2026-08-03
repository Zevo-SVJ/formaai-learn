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

## The one command

The build already produces a Cloudflare Worker. This deploys it under a
different worker name, which is what keeps it away from production: a different
name is a different Worker, with its own URL and its own lifecycle. Nothing
about `zevo-svj-formaai-learn` — the production Worker — is read or written.

```bash
npm run preview:deploy
```

The first run asks for a Cloudflare login in the browser. The URL it prints at
the end is the one to send:

```
https://forma-preview.<your-subdomain>.workers.dev
```

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
