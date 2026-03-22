# Rules for writing tips

This file is the source of truth for how tips in this repo should be added, rewritten, or fixed.

Use it before editing `README.md`.

## Goal

This repo is trying to become the best practical database of OpenClaw tips.

That means every tip should feel:

- practical
- specific
- tested or grounded in real OpenClaw behavior
- useful enough that someone can copy it and implement it
- free of AI-slop wording, filler, and generic advice

## What a good tip looks like

Each tip should have all of these properties:

1. A real failure mode
- The tip should solve an actual problem, not just state a principle.
- Good: cost drift, weak memory, bad compaction behavior, fake completion, poor retrieval.
- Bad: vague philosophy without a concrete OpenClaw behavior behind it.

2. Concrete OpenClaw grounding
- The tip should be based on one of:
  - OpenClaw docs
  - OpenClaw source behavior
  - runbook examples
  - collected community tips that match real product behavior
- If a tip sounds right but is not grounded in actual OpenClaw behavior, stop and verify first.

3. Exact implementation details
- Prefer exact file paths, config keys, commands, and prompts.
- If the tip can be implemented, show the exact block.
- Do not say vague things like "update your setup" or "refactor your config" when you can say what file and what key.

4. A copyable implementation prompt
- Every tip should include a collapsible block:

```html
<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
... prompt here ...
```

</details>
```

- The prompt must tell OpenClaw exactly what to create, update, enable, or verify.
- The prompt should define the target state, not just ask for a vague refactor.

5. Supporting files when needed
- If a tip needs real helper files, store them under `tips/<tip-id>/`.
- Example:

```text
tips/mem-03/rebuild-db.js
tips/mem-03/relevant-memory.js
```

- Only create a tip folder when that tip actually needs supporting assets.
- Do not create empty folders.

## How the README should be structured

- Tips stay in `README.md`
- Tips are grouped by category
- Tip ids use this format:
  - `MEM-01`
  - `REL-01`
  - `COST-01`
  - `ARCH-01`
  - `AUTO-01`
  - `OPS-01`

- Keep tips in order inside each category.
- When adding a new tip, append it after the previous tip in that category unless explicitly told otherwise.

## Writing style for this repo

Current repo style is not pure first-person.

Use this voice instead:

- direct
- practical
- specific
- plainspoken
- not overhyped

Avoid:

- fake authority
- hype words
- vague claims
- filler openings
- generic productivity advice dressed up as an OpenClaw tip

Good:

- "Turn on the built-in pre-compaction memory flush"
- "Build the database: `node tips/mem-03/rebuild-db.js`"
- "Important facts belong in `MEMORY.md`"

Bad:

- "Refactor your setup for better resilience"
- "Leverage memory architecture to unlock durable context"
- "This changes everything"

## Tip title rules

- Titles should be descriptive, not clickbait.
- The reader should know what the tip is about from the title alone.
- Use sentence case.
- Keep the id in the title.

Good:

- `### MEM-03: Use SQLite memory search before you pay for embeddings`
- `### MEM-04: Treat chat history as cache, not the source of truth`

## First paragraph rules

- Start with the actual problem.
- No long preamble.
- No "this is important" style filler.
- The first paragraph should make clear why the tip exists.

## Prompt block rules

The collapsible prompt is not decoration. It is part of the tip.

It should:

- say exactly what files to create or change
- say exactly what config keys to set
- mention any supporting files in this repo when they exist
- include raw GitHub URLs only when the supporting files already exist in the public repo
- ask for a short report of what changed

It should not:

- ask for a generic "refactor"
- leave the target state ambiguous
- invent files or structures unless the tip is actually about creating them

## Rules for supporting files

If a tip needs supporting files:

- store them in `tips/<tip-id>/`
- reference repo-relative paths in the tip body
- include raw GitHub URLs in the copy prompt when useful
- keep the files minimal and directly usable

Do not:

- reference files outside this repo as if the reader can see them
- say "the version in some other folder"
- depend on private local context

## Source-of-truth rules

- Everything public-facing must make sense from the repo alone.
- If the tip mentions a file, config, or script, that thing should either:
  - exist in the repo, or
  - be a standard OpenClaw file/config the user is expected to have

- Do not rely on hidden local folders or side repositories.

## When a tip should be rejected or rewritten

Rewrite or skip a tip if:

- it sounds true but has no concrete OpenClaw backing
- it overlaps too much with an existing tip
- it is just a principle with no implementation shape
- it cannot produce a good copy-paste prompt
- it depends on made-up file structures when OpenClaw already has a real pattern

## Editing checklist for every new tip

Before finalizing a tip, check:

- Is the failure mode clear?
- Is it grounded in docs/source/runbook/community evidence?
- Does it avoid generic wording?
- Does it include exact config, commands, files, or prompts when possible?
- Does it have a strong collapsible implementation prompt?
- Are any supporting files placed under `tips/<tip-id>/`?
- Does it fit the category order?
- Does it overlap too much with an earlier tip?

## Current repo-specific preferences

- Move tips from `README_OLD.md` into `README.md` one by one.
- Do not bulk-copy the old README.
- Fix each tip to match the new format as it is added.
- Keep the new format consistent across tips.
- Prefer repo-contained examples and assets.

## Short version

Every tip should answer four things:

1. What breaks?
2. What exact thing fixes it?
3. What exactly should the reader copy, enable, or create?
4. Can OpenClaw implement this from one prompt?

If the tip cannot answer those four clearly, it is not ready.
