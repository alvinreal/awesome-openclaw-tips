<div align="center">

<img src="./assets/cover.jpg" alt="OpenClaw Tips cover" width="100%" />

<br />
<br />

# Awesome OpenClaw Tips

<strong>The practical playbook for turning OpenClaw from a fun chatbot into a reliable operating system for recurring work.</strong>

<br />

![Tips](https://img.shields.io/badge/tips-18-8b5cf6?style=flat-square)
![Topics](https://img.shields.io/badge/topics-memory%2C%20reliability%2C%20cost%2C%20automation-0f172a?style=flat-square)
![Status](https://img.shields.io/badge/status-tested%20and%20curated-16a34a?style=flat-square)

</div>

OpenClaw gets valuable when it stops acting like a chat window and starts acting like infrastructure.

Most setups break for predictable reasons: cost drift, context bloat, weak memory, unsafe defaults, too many agents, too much trust in chat history, and not enough visibility into what the system is actually doing.

This repo collects the best practical patterns, prompts, and guardrails for fixing those problems.

## Memory

### MEM-01: Make your agent learn from its mistakes

By default, every session starts clean. Your agent has no memory of the last time it tried something and failed, or the last time you corrected it. Two weeks later, it is still repeating day-three mistakes.

The minimum fix is a `.learnings/` folder in your workspace with two files:

- `.learnings/ERRORS.md` - command failures, breakages, exceptions
- `.learnings/LEARNINGS.md` - corrections, knowledge gaps, workflow discoveries

Add this to `SOUL.md`:

```md
Before starting any task, check .learnings/ for relevant past errors.
When you fail at something or I correct you, log it to .learnings/ immediately.
```

Over time, repeated lessons can be promoted into `SOUL.md` itself so they apply automatically in future sessions.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Implement a self-improving learnings system in my OpenClaw workspace.

Do all of the following:

1. Create a `.learnings/` folder if it does not exist.
2. Create `.learnings/ERRORS.md` for failures, breakages, command errors, and exceptions.
3. Create `.learnings/LEARNINGS.md` for corrections, workflow discoveries, preferences, and things the agent should remember.
4. Update `SOUL.md` so it includes these rules:
   - Before starting any task, check `.learnings/` for relevant past errors.
   - When you fail at something or I correct you, log it to `.learnings/` immediately.
5. If there is already an existing memory or lessons system, merge carefully instead of duplicating it.
6. Add a short section explaining how future entries should be written so the files stay useful.

Then show me:
- what files you created or changed
- the exact rules you added
- one example `ERRORS.md` entry
- one example `LEARNINGS.md` entry
```

</details>

For a fuller version with automatic hooks, structured entries, and a promotion workflow, install the [self-improving-agent skill](https://clawhub.ai/pskoett/self-improving-agent).

### MEM-02: Flush important state before compaction eats it

Long OpenClaw sessions do not grow forever. Once context gets full, OpenClaw auto-compacts the session. That usually means a summary survives, plus recent turns. Anything important that only lives in chat is now at risk.

Treat compaction as a deadline. Important state should already be on disk before it happens.

Turn on the built-in pre-compaction memory flush:

```json
"agents": {
  "defaults": {
    "compaction": {
      "memoryFlush": {
        "enabled": true,
        "softThresholdTokens": 4000
      }
    }
  }
}
```

This watches context usage, triggers a silent flush before hard compaction, and writes durable state to the workspace. It runs once per compaction cycle and uses `NO_REPLY`, so it does not spam the user.

This pairs naturally with `MEM-01`. Chat is working memory. Files are memory.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Implement pre-compaction memory flushing in my OpenClaw setup so important state gets written to disk before context compaction happens.

Do all of the following:

1. Find my OpenClaw config and enable built-in pre-compaction memory flush.
2. Set this config:
   - `agents.defaults.compaction.memoryFlush.enabled = true`
   - `agents.defaults.compaction.memoryFlush.softThresholdTokens = 4000`
3. Check whether I already have a durable memory system such as `.learnings/`, `MEMORY.md`, or other workspace state files.
4. If I do, make sure the setup works with that existing system instead of creating a duplicate memory path.
5. If I do not, create a minimal durable place where important state should be flushed before compaction.
6. Add a short note in the relevant workspace instructions explaining that chat is not durable memory and important state must live in files.

Then show me:
- which config file you changed
- the exact config block you added or updated
- where important state will be flushed to
- any assumptions you made about my current memory setup
```

</details>

### MEM-03: Use SQLite memory search before you pay for embeddings

Most personal OpenClaw setups do not need a vector database just to find old notes. A local SQLite index with FTS5 is often enough.

This tip ships with supporting files in `tips/mem-03/`.

Build the database:

```bash
node tips/mem-03/rebuild-db.js
```

Search it:

```bash
node tips/mem-03/relevant-memory.js "query about previous work"
```

The scripts scan markdown files, build a SQLite database, and use full-text search to surface likely matches quickly. No API costs, no embedding pipeline, no external service.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Implement a lightweight SQLite memory search system in my OpenClaw workspace so I can search past notes without paying for embeddings.

Use these supporting files from this repo:
- `tips/mem-03/rebuild-db.js`
- `tips/mem-03/relevant-memory.js`

If needed, fetch them directly from:
- https://raw.githubusercontent.com/alvinunreal/awesome-openclaw-tips/main/tips/mem-03/rebuild-db.js
- https://raw.githubusercontent.com/alvinunreal/awesome-openclaw-tips/main/tips/mem-03/relevant-memory.js

Do all of the following:

1. Copy those files into my OpenClaw workspace in a sensible location.
2. Make sure the database output path and command examples match where you placed them.
3. Build the SQLite memory index.
4. Test one search query against my workspace.
5. Add a short note to my workspace instructions explaining when to use SQLite memory search before reading raw markdown files.
6. If I already have another memory system, integrate carefully instead of replacing it.

Then show me:
- where you placed the files
- the exact commands to rebuild and search
- one sample query and its result
- any assumptions you made about my current memory layout
```

</details>

### MEM-04: Treat chat history as cache, not the source of truth

If you want OpenClaw to remember things reliably, write them to the files OpenClaw already knows how to use. Transcript memory is fragile. Compaction, resets, and long idle gaps all make chat a bad place to keep anything important.

OpenClaw already has a real file pattern for this:

- `MEMORY.md` - durable facts, preferences, decisions
- `memory/YYYY-MM-DD.md` - daily notes and running context
- `AGENTS.md` - standing rules for how the agent should use those files

That is the practical version of "chat is cache". Important facts belong in `MEMORY.md`. Short-term working context belongs in daily memory files. `AGENTS.md` should tell the agent to read and update them instead of trusting the transcript to carry everything forward.

If task state matters too, put that in an actual task system or another durable store you already use. The rule is the same: if losing the transcript would break the workflow, the state is in the wrong place.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Set up durable memory files in my OpenClaw workspace so important context does not depend on chat history.

Do all of the following:

1. Create or update `MEMORY.md` for durable facts, preferences, and decisions.
2. Create or update `memory/YYYY-MM-DD.md` for short-term running context and daily notes.
3. Update `AGENTS.md` so the agent:
   - reads `MEMORY.md` when present
   - uses `memory/YYYY-MM-DD.md` for ongoing notes
   - writes important facts to files instead of relying on transcript memory
4. If these files already exist, merge carefully instead of duplicating them.
5. If task state belongs in another durable system I already use, keep it there and document that clearly instead of inventing a second task system.
6. Keep the setup aligned with normal OpenClaw workspace conventions.

Then show me:
- what files you created or changed
- the exact rules you added to `AGENTS.md`
- what belongs in `MEMORY.md` vs `memory/YYYY-MM-DD.md`
- any assumptions you made
```

</details>

### MEM-05: Split conversations into threads so context stops bleeding across topics

One long OpenClaw conversation turns into a junk drawer. Coding, research, admin, and random questions all get mixed together, and every new turn drags that baggage forward.

OpenClaw already has session boundaries you can use. Group chats isolate state by group. Telegram forum topics get their own `:topic:<threadId>` session keys. Slack and Discord threads are treated as thread sessions. Discord channels also get their own isolated sessions.

That means the practical fix is simple: split work by topic or channel. Keep one thread for coding, another for research, another for admin, another for personal operations. Focused threads give the agent focused context instead of one huge mixed transcript.

This is one of the easiest memory fixes because it does not require a new memory system. It just uses OpenClaw's existing session isolation properly.

For Telegram specifically, BotFather has a setting for this now. Open BotFather, choose your bot from **My bots**, go to **Bot Settings**, and turn on **Threaded Mode**.

<p align="center">
  <img src="./tips/mem-05/telegram-1.png" alt="Open BotFather and choose your bot from My bots" width="30%" />
  <img src="./tips/mem-05/telegram-2.png" alt="Enable Threaded Mode in Bot Settings" width="30%" />
  <img src="./tips/mem-05/telegram-3.png" alt="Telegram chat using separate topic tabs" width="34%" />
</p>

Once it is enabled, Telegram gives the bot separate tabs/topics in the chat UI. That is exactly what this tip needs - coding in one topic, research in another, admin in another - instead of one mixed transcript where everything contaminates everything else.
