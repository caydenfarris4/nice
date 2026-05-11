# nice

A web app for managing projects, attaching source files (PDF / TXT / MD / CSV), and analyzing them with Claude through three lenses:

- **ROI opportunities** — impact-vs-effort scatter plus a ranked table.
- **Roadmap changes** — recommended adds/cuts/defers with a quarterly timeline.
- **Psychological evaluation** — traits radar, strengths, blind spots, biases.

Plus a per-project chat that uses a two-stage prompt pipeline:

1. `prompts/initial.md` frames the question into a structured brief.
2. A worker answers grounded in the project's sources.
3. `prompts/synthesizer.md` produces the final user-facing response.

## Stack

Next.js 15 (App Router) · TypeScript · Cloudflare D1 (SQLite) · Tailwind · Recharts · Anthropic SDK · `@opennextjs/cloudflare` adapter.

Runs on Cloudflare Workers. Auto-deploys on push to GitHub when connected through the Cloudflare dashboard.

## Deploy to Cloudflare (first time)

### 1. Create the D1 database

```bash
npx wrangler login
npx wrangler d1 create nice
```

Copy the `database_id` it prints and paste it into `wrangler.toml` (`REPLACE_WITH_YOUR_D1_DATABASE_ID`). Commit the change.

### 2. Apply the schema

```bash
npm run db:migrate           # remote: creates tables in your D1 instance
npm run db:migrate:local     # optional: same thing in your local dev DB
```

### 3. Set your Anthropic API key

```bash
npx wrangler secret put ANTHROPIC_API_KEY
# paste your key when prompted
```

### 4. Connect the GitHub repo to Cloudflare Workers

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository**.
2. Select this repo and the `claude/setup-synthesizer-prompts-IVMP9` branch (or whichever branch you want to deploy).
3. Framework preset: **Next.js (OpenNext)**.
4. Build command: `npm run deploy` (or leave default if Cloudflare auto-detects).
5. Save and deploy.

After the first deploy, every push to the configured branch redeploys automatically.

### 5. Connect your domain

In the Worker's dashboard → **Settings** → **Triggers** → **Custom Domains** → add your domain (or subdomain). Cloudflare handles DNS automatically if the domain is already on your account.

## Local development

```bash
cp .dev.vars.example .dev.vars      # then set ANTHROPIC_API_KEY
npm install
npm run db:migrate:local            # create local D1 tables
npm run dev                         # http://localhost:3030
```

`next dev` runs with Cloudflare bindings (D1, env vars) via OpenNext's dev platform.

To run the production Worker bundle locally:

```bash
npm run preview
```

## Editing on github.com

Click the pencil icon on any file → edit → commit. Cloudflare picks up the push and redeploys (~1 min). No local clone needed.

To add a new lens:

1. Add `prompts/lenses/<name>.md` (canonical copy for humans) and add the corresponding constant to `lib/prompts.ts`.
2. Add `<name>` to the `VALID` set in `app/api/projects/[id]/lens/[name]/route.ts` and the lens union in `lib/pipeline.ts`.
3. Add a panel renderer in `components/Lenses.tsx`.

## Layout

```
app/                   pages + API routes
components/            UI (Sources, Chat, Lenses)
lib/                   db, claude client, parsers, pipeline, prompts
prompts/               canonical markdown (mirror of lib/prompts.ts constants)
migrations/            D1 SQL migrations
wrangler.toml          Cloudflare Worker config (bindings, secrets)
open-next.config.ts    OpenNext adapter config
```
