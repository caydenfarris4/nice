# nice

A local web app for managing projects, attaching source files (PDF / TXT / MD / CSV), and analyzing them with Claude through three lenses:

- **ROI opportunities** — impact-vs-effort scatter plus a ranked table.
- **Roadmap changes** — recommended adds/cuts/defers with a quarterly timeline.
- **Psychological evaluation** — traits radar, strengths, blind spots, biases.

Plus a per-project chat that uses a two-stage prompt pipeline:

1. `prompts/initial.md` frames the question into a structured brief.
2. A worker answers grounded in the project's sources.
3. `prompts/synthesizer.md` produces the final user-facing response.

## Run it

```bash
cp .env.example .env.local           # then fill in ANTHROPIC_API_KEY
npm install
npm run dev
```

Open http://localhost:3000.

## Stack

Next.js 15 (App Router) · TypeScript · SQLite (better-sqlite3) · Tailwind · Recharts · Anthropic SDK.

Data lives in `./data/nice.db` (gitignored). Delete the file to reset.

## Layout

```
app/                   pages + API routes
components/            UI (Sources, Chat, Lenses)
lib/                   db, claude client, parsers, pipeline
prompts/               initial.md, synthesizer.md, lenses/*.md
```

## Adding a new lens

1. Add `prompts/lenses/<name>.md` with the JSON schema you want back.
2. Add `<name>` to the `VALID` set in `app/api/projects/[id]/lens/[name]/route.ts` and the lens-name union in `lib/pipeline.ts`.
3. Add a panel renderer in `components/Lenses.tsx`.
```
