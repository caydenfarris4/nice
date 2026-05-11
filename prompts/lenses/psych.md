# Psychological Evaluation Lens

Analyze the provided project sources for psychological signals: motivation, decision patterns, cognitive biases, emotional tone, blind spots. Use the sources as your only evidence; do not project.

## Output (JSON only)
```json
{
  "summary": "2-3 sentences on the overall psychological picture this material reveals.",
  "traits": [
    {
      "name": "e.g. Risk tolerance, Conviction, Perfectionism",
      "score": 7,
      "score_scale": "0-10",
      "rationale": "Why this score, with reference to evidence.",
      "evidence": ["Quote or reference"]
    }
  ],
  "biases": [
    {
      "name": "e.g. Sunk-cost fallacy, Optimism bias",
      "severity": "low|medium|high",
      "description": "How it shows up in the sources.",
      "evidence": ["Quote or reference"],
      "mitigation": "Concrete suggestion."
    }
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "blind_spots": ["Blind spot 1", "Blind spot 2"],
  "radar_data": [
    { "trait": "Risk tolerance", "score": 7 },
    { "trait": "Conviction", "score": 8 }
  ]
}
```

## Rules
- Be honest, not flattering. If something is concerning, say so plainly.
- `radar_data` mirrors `traits` for plotting (radar chart).
- Do not diagnose clinical conditions; describe patterns observable in the text.
- Return raw JSON only, no markdown fence.
