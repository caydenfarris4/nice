# Roadmap Lens

Analyze the provided project sources and recommend roadmap changes.

## Output (JSON only)
```json
{
  "summary": "1-2 sentences on the current roadmap health and the recommended direction.",
  "changes": [
    {
      "action": "add|cut|defer|accelerate|reprioritize",
      "item": "Name of the feature/initiative",
      "rationale": "Why, grounded in evidence from sources.",
      "priority": "P0|P1|P2|P3",
      "effort_weeks": 4,
      "dependencies": ["Other items this depends on"],
      "evidence": ["Quote or reference from a specific source"]
    }
  ],
  "timeline": [
    { "quarter": "Q1", "items": ["Item A", "Item B"] },
    { "quarter": "Q2", "items": ["Item C"] }
  ]
}
```

## Rules
- Only recommend changes grounded in the sources. If the sources don't cover an area, say so in `summary` rather than inventing.
- `timeline` should reflect the recommended sequencing after applying `changes`.
- Sort `changes` by priority (P0 first).
- Return raw JSON only, no markdown fence.
