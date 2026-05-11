"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export function Chat({ projectId }: { projectId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    const res = await fetch(`/api/projects/${projectId}/messages`);
    const json = (await res.json()) as { messages?: Message[] };
    setMessages(json.messages ?? []);
  }
  useEffect(() => {
    refresh();
  }, [projectId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true);
    setError(null);
    setQuestion("");
    setMessages((m) => [...m, { id: Date.now(), role: "user", content: q, created_at: new Date().toISOString() }]);
    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Request failed");
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white flex flex-col h-[600px]">
      <div className="border-b border-black/10 px-4 py-2.5 text-sm font-semibold">Ask</div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !busy && (
          <p className="text-sm text-black/50">Ask a question about this project's sources.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
            <div
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user" ? "bg-ink text-white" : "bg-black/5"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div>
            <div className="inline-block rounded-lg bg-black/5 px-3 py-2 text-sm text-black/60">
              thinking…
            </div>
          </div>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <form onSubmit={send} className="border-t border-black/10 p-3 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you want to know?"
          className="flex-1 rounded border border-black/15 px-3 py-2 text-sm"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !question.trim()}
          className="rounded bg-ink text-white px-3 py-2 text-sm disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
