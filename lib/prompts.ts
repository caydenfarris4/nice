import { readFileSync } from "node:fs";
import { join } from "node:path";

const PROMPTS_DIR = join(process.cwd(), "prompts");

function load(name: string): string {
  return readFileSync(join(PROMPTS_DIR, name), "utf8");
}

export const PROMPTS = {
  initial: () => load("initial.md"),
  synthesizer: () => load("synthesizer.md"),
  lens: (name: "roi" | "roadmap" | "psych") => load(`lenses/${name}.md`),
};
