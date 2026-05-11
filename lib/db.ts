import { getCloudflareContext } from "@opennextjs/cloudflare";

export type Project = {
  id: number;
  name: string;
  description: string;
  created_at: string;
};

export type Source = {
  id: number;
  project_id: number;
  filename: string;
  mime_type: string;
  size: number;
  content: string;
  created_at: string;
};

export type Message = {
  id: number;
  project_id: number;
  role: "user" | "assistant";
  content: string;
  brief: string | null;
  created_at: string;
};

export type Analysis = {
  id: number;
  project_id: number;
  lens: string;
  payload: string;
  created_at: string;
};

function db(): D1Database {
  const { env } = getCloudflareContext();
  const d1 = (env as unknown as { DB?: D1Database }).DB;
  if (!d1) throw new Error("D1 binding 'DB' is not configured. See README for setup.");
  return d1;
}

export const queries = {
  async listProjects(): Promise<Project[]> {
    const { results } = await db()
      .prepare("SELECT * FROM projects ORDER BY created_at DESC")
      .all<Project>();
    return results ?? [];
  },

  async getProject(id: number): Promise<Project | null> {
    return (await db().prepare("SELECT * FROM projects WHERE id = ?").bind(id).first<Project>()) ?? null;
  },

  async createProject(name: string, description: string): Promise<Project> {
    const result = await db()
      .prepare("INSERT INTO projects (name, description) VALUES (?, ?) RETURNING *")
      .bind(name, description)
      .first<Project>();
    if (!result) throw new Error("Failed to create project");
    return result;
  },

  async deleteProject(id: number): Promise<void> {
    await db().prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
  },

  async listSources(projectId: number): Promise<Omit<Source, "content">[]> {
    const { results } = await db()
      .prepare(
        "SELECT id, project_id, filename, mime_type, size, created_at FROM sources WHERE project_id = ? ORDER BY created_at DESC"
      )
      .bind(projectId)
      .all<Omit<Source, "content">>();
    return results ?? [];
  },

  async getSourcesFull(projectId: number): Promise<Source[]> {
    const { results } = await db()
      .prepare("SELECT * FROM sources WHERE project_id = ? ORDER BY created_at ASC")
      .bind(projectId)
      .all<Source>();
    return results ?? [];
  },

  async insertSource(
    projectId: number,
    filename: string,
    mimeType: string,
    size: number,
    content: string
  ): Promise<number> {
    const result = await db()
      .prepare(
        "INSERT INTO sources (project_id, filename, mime_type, size, content) VALUES (?, ?, ?, ?, ?) RETURNING id"
      )
      .bind(projectId, filename, mimeType, size, content)
      .first<{ id: number }>();
    if (!result) throw new Error("Failed to insert source");
    return result.id;
  },

  async deleteSource(sourceId: number, projectId: number): Promise<void> {
    await db()
      .prepare("DELETE FROM sources WHERE id = ? AND project_id = ?")
      .bind(sourceId, projectId)
      .run();
  },

  async listMessages(projectId: number): Promise<Message[]> {
    const { results } = await db()
      .prepare("SELECT * FROM messages WHERE project_id = ? ORDER BY created_at ASC")
      .bind(projectId)
      .all<Message>();
    return results ?? [];
  },

  async insertMessage(
    projectId: number,
    role: "user" | "assistant",
    content: string,
    brief: string | null
  ): Promise<void> {
    await db()
      .prepare("INSERT INTO messages (project_id, role, content, brief) VALUES (?, ?, ?, ?)")
      .bind(projectId, role, content, brief)
      .run();
  },

  async getAnalysis(projectId: number, lens: string): Promise<Analysis | null> {
    return (
      (await db()
        .prepare(
          "SELECT * FROM analyses WHERE project_id = ? AND lens = ? ORDER BY created_at DESC LIMIT 1"
        )
        .bind(projectId, lens)
        .first<Analysis>()) ?? null
    );
  },

  async insertAnalysis(projectId: number, lens: string, payload: string): Promise<void> {
    await db()
      .prepare("INSERT INTO analyses (project_id, lens, payload) VALUES (?, ?, ?)")
      .bind(projectId, lens, payload)
      .run();
  },
};
