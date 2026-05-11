import Anthropic from "@anthropic-ai/sdk";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type Env = { ANTHROPIC_API_KEY?: string; ANTHROPIC_MODEL?: string };

function readEnv(): Env {
  try {
    return getCloudflareContext().env as unknown as Env;
  } catch {
    return (process.env ?? {}) as Env;
  }
}

function getClient(): { client: Anthropic; model: string } {
  const env = readEnv();
  const apiKey = env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const model = env.ANTHROPIC_MODEL ?? process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";
  return { client: new Anthropic({ apiKey }), model };
}

export type SourceBlob = { filename: string; content: string };

export function buildSourcesText(sources: SourceBlob[]): string {
  if (sources.length === 0) return "(no sources have been added to this project yet)";
  return sources
    .map((s, i) => `=== SOURCE ${i + 1}: ${s.filename} ===\n${s.content}`)
    .join("\n\n");
}

export async function callClaude(args: {
  systemPrompt: string;
  userMessage: string;
  sources: SourceBlob[];
  maxTokens?: number;
}): Promise<string> {
  const { client, model } = getClient();
  const sourcesText = buildSourcesText(args.sources);
  const resp = await client.messages.create({
    model,
    max_tokens: args.maxTokens ?? 4096,
    system: [
      { type: "text", text: args.systemPrompt },
      {
        type: "text",
        text: `# Project Sources\n\n${sourcesText}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: args.userMessage }],
  });
  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  return text;
}

export function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model output");
  return JSON.parse(candidate.slice(start, end + 1));
}
