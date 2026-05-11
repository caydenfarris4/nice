"use client";

import { useEffect, useRef, useState } from "react";

type Source = {
  id: number;
  filename: string;
  mime_type: string;
  size: number;
  created_at: string;
};

export function Sources({ projectId }: { projectId: number }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  async function refresh() {
    const res = await fetch(`/api/projects/${projectId}/sources`);
    const json = (await res.json()) as { sources?: Source[] };
    setSources(json.sources ?? []);
  }
  useEffect(() => {
    refresh();
  }, [projectId]);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setErrors([]);
    const form = new FormData();
    for (const f of Array.from(files)) form.append("file", f);
    try {
      const res = await fetch(`/api/projects/${projectId}/sources`, { method: "POST", body: form });
      const json = (await res.json()) as { errors?: { filename: string; message: string }[] };
      if (json.errors?.length) setErrors(json.errors.map((e) => `${e.filename}: ${e.message}`));
      await refresh();
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function remove(id: number) {
    await fetch(`/api/projects/${projectId}/sources/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Sources ({sources.length})</h2>
        <label className="text-xs cursor-pointer text-accent hover:underline">
          {busy ? "Uploading…" : "+ Add files"}
          <input
            ref={fileInput}
            type="file"
            multiple
            accept=".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv"
            className="hidden"
            onChange={(e) => upload(e.target.files)}
            disabled={busy}
          />
        </label>
      </div>
      {errors.length > 0 && (
        <ul className="mb-3 text-xs text-red-600">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
      {sources.length === 0 ? (
        <p className="text-sm text-black/50">No sources yet. PDF, TXT, MD, CSV.</p>
      ) : (
        <ul className="grid gap-1.5">
          {sources.map((s) => (
            <li key={s.id} className="flex items-center justify-between text-sm">
              <span className="truncate" title={s.filename}>
                <span className="text-black/40 text-xs mr-2">{prettyType(s.mime_type)}</span>
                {s.filename}
              </span>
              <button onClick={() => remove(s.id)} className="text-xs text-black/40 hover:text-red-600">
                remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function prettyType(mime: string): string {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("csv")) return "CSV";
  if (mime.includes("markdown")) return "MD";
  return "TXT";
}
