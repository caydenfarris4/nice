import Link from "next/link";
import { notFound } from "next/navigation";
import { queries, type Project } from "@/lib/db";
import { Sources } from "@/components/Sources";
import { Chat } from "@/components/Chat";
import { Lenses } from "@/components/Lenses";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = queries.getProject.get(Number(id)) as Project | undefined;
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-black/50 hover:underline">← Projects</Link>
        <h1 className="text-2xl font-semibold mt-1">{project.name}</h1>
        {project.description ? (
          <p className="text-sm text-black/60 mt-1">{project.description}</p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
        <div className="space-y-4">
          <Sources projectId={project.id} />
        </div>
        <div className="space-y-6">
          <Chat projectId={project.id} />
          <Lenses projectId={project.id} />
        </div>
      </div>
    </div>
  );
}
