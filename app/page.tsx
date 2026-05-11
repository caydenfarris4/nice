"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Project = { id: number; name: string; description: string; created_at: string };

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/projects");
    const json = (await res.json()) as { projects?: Project[] };
    setProjects(json.projects ?? []);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      setName("");
      setDescription("");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this project and all its sources?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr,360px]">
      <section>
        <h1 className="text-2xl font-semibold mb-4">Projects</h1>
        {projects.length === 0 ? (
          <p className="text-black/60">No projects yet. Create one to get started.</p>
        ) : (
          <ul className="grid gap-3">
            {projects.map((p) => (
              <li key={p.id} className="rounded-lg border border-black/10 bg-white p-4 flex items-start justify-between">
                <div>
                  <Link href={`/projects/${p.id}`} className="text-lg font-medium hover:underline">
                    {p.name}
                  </Link>
                  {p.description ? (
                    <p className="text-sm text-black/60 mt-1">{p.description}</p>
                  ) : null}
                  <p className="text-xs text-black/40 mt-2">created {p.created_at}</p>
                </div>
                <button
                  onClick={() => remove(p.id)}
                  className="text-xs text-black/40 hover:text-red-600"
                >
                  delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="rounded-lg border border-black/10 bg-white p-4 h-fit">
        <h2 className="font-semibold mb-3">New project</h2>
        <form onSubmit={create} className="grid gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="rounded border border-black/15 px-3 py-2 text-sm"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            rows={3}
            className="rounded border border-black/15 px-3 py-2 text-sm resize-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-ink text-white px-3 py-2 text-sm disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create"}
          </button>
        </form>
      </aside>
    </div>
  );
}
