"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

type LensName = "roi" | "roadmap" | "psych";

const LABELS: Record<LensName, string> = {
  roi: "ROI Opportunities",
  roadmap: "Roadmap Changes",
  psych: "Psychological Evaluation",
};

type Analysis = { id: number; lens: LensName; payload: unknown; created_at: string } | null;

export function Lenses({ projectId }: { projectId: number }) {
  const [active, setActive] = useState<LensName>("roi");
  return (
    <div className="rounded-lg border border-black/10 bg-white">
      <div className="border-b border-black/10 flex">
        {(Object.keys(LABELS) as LensName[]).map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`px-4 py-2.5 text-sm border-b-2 ${
              active === k ? "border-ink font-semibold" : "border-transparent text-black/60"
            }`}
          >
            {LABELS[k]}
          </button>
        ))}
      </div>
      <div className="p-4">
        <LensPanel projectId={projectId} lens={active} />
      </div>
    </div>
  );
}

function LensPanel({ projectId, lens }: { projectId: number; lens: LensName }) {
  const [analysis, setAnalysis] = useState<Analysis>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/projects/${projectId}/lens/${lens}`);
    const json = (await res.json()) as { analysis: Analysis };
    setAnalysis(json.analysis);
  }
  useEffect(() => {
    setAnalysis(null);
    setError(null);
    load();
  }, [projectId, lens]);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/lens/${lens}`, { method: "POST" });
      const json = (await res.json()) as { error?: string; payload?: unknown };
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Failed");
      } else {
        setAnalysis({ id: 0, lens, payload: json.payload, created_at: new Date().toISOString() });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-black/60">
          {analysis ? `Last run: ${analysis.created_at}` : "Not yet generated."}
        </p>
        <button
          onClick={run}
          disabled={busy}
          className="rounded bg-ink text-white px-3 py-2 text-sm disabled:opacity-50"
        >
          {busy ? "Running…" : analysis ? "Re-run" : "Run lens"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {analysis && (
        <>
          {lens === "roi" && <RoiView payload={analysis.payload} />}
          {lens === "roadmap" && <RoadmapView payload={analysis.payload} />}
          {lens === "psych" && <PsychView payload={analysis.payload} />}
        </>
      )}
    </div>
  );
}

type Roi = {
  summary: string;
  opportunities: {
    title: string;
    description: string;
    impact_usd: number;
    impact_confidence: string;
    effort_weeks: number;
    effort_confidence: string;
    evidence: string[];
    category: string;
  }[];
  chart_data: { title: string; impact_usd: number; effort_weeks: number }[];
};

function RoiView({ payload }: { payload: unknown }) {
  const data = payload as Roi;
  return (
    <div className="space-y-5">
      <p className="text-sm">{data.summary}</p>
      <div className="h-72 border border-black/10 rounded p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 12, right: 24, bottom: 24, left: 24 }}>
            <CartesianGrid stroke="#0001" />
            <XAxis dataKey="effort_weeks" name="Effort (weeks)" type="number">
              <Legend />
            </XAxis>
            <YAxis dataKey="impact_usd" name="Impact (USD)" type="number" tickFormatter={(v) => `$${v.toLocaleString()}`} />
            <ZAxis dataKey="title" name="Opportunity" />
            <Tooltip formatter={(v: number, n: string) => (n === "impact_usd" ? `$${v.toLocaleString()}` : v)} />
            <Scatter name="Opportunities" data={data.chart_data ?? []} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-black/60 text-xs">
            <th className="py-2">Opportunity</th>
            <th>Impact</th>
            <th>Effort</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {data.opportunities?.map((o, i) => (
            <tr key={i} className="border-t border-black/5 align-top">
              <td className="py-2 pr-3">
                <div className="font-medium">{o.title}</div>
                <div className="text-xs text-black/60 mt-1">{o.description}</div>
              </td>
              <td className="pr-3 whitespace-nowrap">
                ${o.impact_usd?.toLocaleString()}
                <div className="text-[10px] text-black/50">{o.impact_confidence}</div>
              </td>
              <td className="pr-3 whitespace-nowrap">
                {o.effort_weeks}w
                <div className="text-[10px] text-black/50">{o.effort_confidence}</div>
              </td>
              <td className="pr-3 text-xs">{o.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Roadmap = {
  summary: string;
  changes: {
    action: string;
    item: string;
    rationale: string;
    priority: string;
    effort_weeks: number;
    dependencies: string[];
    evidence: string[];
  }[];
  timeline: { quarter: string; items: string[] }[];
};

function RoadmapView({ payload }: { payload: unknown }) {
  const data = payload as Roadmap;
  return (
    <div className="space-y-5">
      <p className="text-sm">{data.summary}</p>
      <div>
        <h3 className="text-sm font-semibold mb-2">Changes</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-black/60 text-xs">
              <th className="py-2">Action</th>
              <th>Item</th>
              <th>Priority</th>
              <th>Effort</th>
              <th>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {data.changes?.map((c, i) => (
              <tr key={i} className="border-t border-black/5 align-top">
                <td className="py-2 pr-3 uppercase text-xs">{c.action}</td>
                <td className="pr-3 font-medium">{c.item}</td>
                <td className="pr-3 text-xs">{c.priority}</td>
                <td className="pr-3 text-xs whitespace-nowrap">{c.effort_weeks}w</td>
                <td className="pr-3 text-xs text-black/70">{c.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Timeline</h3>
        <div className="grid gap-2 md:grid-cols-4">
          {data.timeline?.map((t, i) => (
            <div key={i} className="rounded border border-black/10 p-3">
              <div className="text-xs font-semibold text-black/60 mb-2">{t.quarter}</div>
              <ul className="text-sm space-y-1">
                {t.items?.map((it, j) => <li key={j}>• {it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type Psych = {
  summary: string;
  traits: { name: string; score: number; rationale: string; evidence: string[] }[];
  biases: { name: string; severity: string; description: string; mitigation: string }[];
  strengths: string[];
  blind_spots: string[];
  radar_data: { trait: string; score: number }[];
};

function PsychView({ payload }: { payload: unknown }) {
  const data = payload as Psych;
  return (
    <div className="space-y-5">
      <p className="text-sm">{data.summary}</p>
      <div className="h-72 border border-black/10 rounded p-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data.radar_data ?? []}>
            <PolarGrid />
            <PolarAngleAxis dataKey="trait" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold mb-2">Strengths</h3>
          <ul className="text-sm space-y-1">
            {data.strengths?.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Blind spots</h3>
          <ul className="text-sm space-y-1">
            {data.blind_spots?.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Biases</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-black/60 text-xs">
              <th className="py-2">Bias</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Mitigation</th>
            </tr>
          </thead>
          <tbody>
            {data.biases?.map((b, i) => (
              <tr key={i} className="border-t border-black/5 align-top">
                <td className="py-2 pr-3 font-medium">{b.name}</td>
                <td className="pr-3 text-xs uppercase">{b.severity}</td>
                <td className="pr-3 text-xs text-black/70">{b.description}</td>
                <td className="pr-3 text-xs text-black/70">{b.mitigation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
