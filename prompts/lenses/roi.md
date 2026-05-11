# ROI Lens

Analyze the provided project sources and identify concrete ROI opportunities.

## Output (JSON only)
```json
{
  "summary": "1-2 sentences on the overall ROI landscape for this project.",
  "opportunities": [
    {
      "title": "Short name",
      "description": "1-3 sentences. What is it, why does it matter.",
      "impact_usd": 12000,
      "impact_confidence": "low|medium|high",
      "effort_weeks": 2,
      "effort_confidence": "low|medium|high",
      "evidence": ["Quote or reference from a specific source"],
      "category": "revenue|cost|risk|efficiency"
    }
  ],
  "chart_data": [
    { "title": "Short name", "impact_usd": 12000, "effort_weeks": 2 }
  ]
}
```

## Rules
- Only include opportunities supported by evidence in the sources. If a number isn't in the sources, mark `impact_confidence: "low"` and explain the assumption in `description`.
- `chart_data` mirrors `opportunities` for plotting (impact vs effort scatter).
- Sort `opportunities` by impact_usd desc.
- Return raw JSON only, no markdown fence.
