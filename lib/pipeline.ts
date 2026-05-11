import { callClaude, extractJson, type SourceBlob } from "./claude";
import { PROMPTS } from "./prompts";

export type Brief = {
  goal: string;
  constraints: string[];
  subtasks: string[];
  open_questions: string[];
  success_criteria: string[];
};

export async function runChat(args: {
  question: string;
  sources: SourceBlob[];
  history: { role: "user" | "assistant"; content: string }[];
}): Promise<{ answer: string; brief: Brief }> {
  const briefRaw = await callClaude({
    systemPrompt: PROMPTS.initial(),
    userMessage: `user_request: ${args.question}\n\nReturn the JSON brief.`,
    sources: args.sources,
    maxTokens: 1024,
  });
  const brief = extractJson(briefRaw) as Brief;

  const workerOutput = await callClaude({
    systemPrompt:
      "You are a research worker. Answer the user's question grounded in the project sources. Cite filenames when you use specific evidence. Be concise.",
    userMessage: buildWorkerMessage(args.question, brief, args.history),
    sources: args.sources,
    maxTokens: 3000,
  });

  const synthInput = [
    `brief: ${JSON.stringify(brief, null, 2)}`,
    "",
    "worker_outputs:",
    JSON.stringify(
      [{ subtask: "answer the question", result: workerOutput, confidence: "medium" }],
      null,
      2
    ),
    "",
    `original_user_question: ${args.question}`,
  ].join("\n");

  const answer = await callClaude({
    systemPrompt: PROMPTS.synthesizer(),
    userMessage: synthInput,
    sources: args.sources,
    maxTokens: 2000,
  });

  return { answer, brief };
}

function buildWorkerMessage(
  question: string,
  brief: Brief,
  history: { role: string; content: string }[]
): string {
  const recent = history.slice(-6);
  const historyText = recent.length
    ? "Recent conversation:\n" + recent.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n") + "\n\n"
    : "";
  return `${historyText}Question: ${question}\n\nFraming:\n${JSON.stringify(brief, null, 2)}\n\nAnswer the question.`;
}

export async function runLens(args: {
  lens: "roi" | "roadmap" | "psych";
  sources: SourceBlob[];
}): Promise<unknown> {
  const raw = await callClaude({
    systemPrompt: PROMPTS.lens(args.lens),
    userMessage:
      "Run the lens on the project sources above. Return the JSON object exactly as specified.",
    sources: args.sources,
    maxTokens: 4000,
  });
  return extractJson(raw);
}
