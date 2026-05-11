# nice

Prompts for a two-stage pipeline:

- `prompts/initial.md` — frames a raw user request into a structured brief.
- `prompts/synthesizer.md` — combines worker outputs against that brief into the final user-facing answer.

Worker agents sit between the two stages and execute the subtasks listed in the brief.
