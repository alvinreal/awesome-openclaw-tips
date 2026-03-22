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

### MEM-06: Make the workspace folder the source of truth and put it under git

`AGENTS.md`, `SOUL.md`, `TOOLS.md`, `IDENTITY.md`, `USER.md`, `HEARTBEAT.md`, `MEMORY.md`, and `memory/` are not loose notes. They are operating state.

OpenClaw's own docs recommend treating the workspace as private memory and putting it in a private git repo. That gives you backup, diff, and a clean way to see when a prompt, memory file, or operating rule changed.

The practical setup is simple:

```bash
git init
git add AGENTS.md SOUL.md TOOLS.md IDENTITY.md USER.md HEARTBEAT.md MEMORY.md memory/
git commit -m "Add agent workspace"
```

If you use GitHub or GitLab, make the repo private and push it there. If git is installed, brand-new OpenClaw workspaces can even auto-initialize, which tells you this is not a weird custom pattern - it is a normal way to treat the workspace.

This pairs naturally with `MEM-04`. If the workspace is the source of truth, git is how you keep that source of truth recoverable.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Set up my OpenClaw workspace as a private git-backed source of truth.

Do all of the following:

1. Check whether my OpenClaw workspace is already a git repo.
2. If it is not, initialize git in the workspace.
3. Add the main OpenClaw workspace files when present, including:
   - `AGENTS.md`
   - `SOUL.md`
   - `TOOLS.md`
   - `IDENTITY.md`
   - `USER.md`
   - `HEARTBEAT.md`
   - `MEMORY.md`
   - `memory/`
4. Create an initial commit if one does not already exist.
5. If a `.gitignore` is needed for local noise, add a minimal one.
6. If a remote is already configured, show it.
7. If no remote exists and GitHub CLI (`gh`) is installed and authenticated, create a new private GitHub repo automatically, prefer a name like `openclaw-workspace-<bot-name>`, add `origin`, and push.
8. If `gh` is not available or not authenticated, do not fail vaguely - tell me the exact manual commands to create a private repo with a sensible name like `openclaw-workspace-<bot-name>`, add `origin`, and push.

Then show me:
- whether the workspace was already under git
- what files were added to version control
- the exact commit you created, if any
- whether you created and pushed a private remote automatically
- if not, the exact commands I should run next
```

</details>

### MEM-07: Back up your workspace continuously, not just once

`git init` is not the backup. The backup only becomes real once you keep pushing updates.

OpenClaw's workspace docs already show the ongoing loop:

```bash
git status
git add .
git commit -m "Update memory"
git push
```

That is the habit to build. Prompts change. `MEMORY.md` changes. `memory/` changes. If the private repo only got the first commit and never gets the later updates, it is not really your source of truth backup.

The practical version is simple: put the backup policy in `AGENTS.md`, then run it from a dedicated cron. `AGENTS.md` should define what counts as a meaningful change. The cron should do the actual check and sync. This does not belong in `HEARTBEAT.md` - heartbeat is for health checks, not workspace maintenance.

Commit and push on meaningful workspace changes, not every tiny edit. Good triggers are prompt updates, new durable memories, workflow changes, or anything in the workspace that you would hate to lose.

For example:

```bash
openclaw cron create \
  --name workspace-backup-check \
  --cron "0 21 * * *" \
  --message "Check the workspace git repo. If meaningful workspace files changed, commit and push them. Skip trivial noise. Never commit secrets or anything under ~/.openclaw/. Report what happened."
```

<p align="center">
  <img src="./tips/mem-07/workspace-backup-check.png" alt="OpenClaw cron job configured for workspace backup checks" width="100%" />
</p>

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Set up a practical ongoing backup workflow for my OpenClaw workspace repo so updates keep getting pushed after the initial setup.

Do all of the following:

1. Check whether my OpenClaw workspace already has a git remote configured.
2. Show me the exact files or folders in the workspace that should be treated as backup-worthy operating state.
3. Add a short rule to `AGENTS.md` explaining that workspace changes should be committed and pushed on meaningful changes, not every tiny edit.
4. Set this up as a dedicated cron or scheduled backup check, not as a heartbeat task.
5. If there is already a good place for a scheduled backup rule, reuse it instead of inventing a second system.
6. Include the standard ongoing sync commands:
   - `git status`
   - `git add .`
   - `git commit -m "Update memory"`
   - `git push`
7. Add a short warning not to commit secrets, tokens, passwords, or anything under `~/.openclaw/`.
8. If you see a simple safe way to automate reminders without blindly auto-pushing, suggest it.

Then show me:
- whether a remote is already configured
- what counts as backup-worthy workspace state
- the exact `AGENTS.md` rule you added
- how the dedicated cron or scheduled check should run
- the exact ongoing sync commands
- the secret-safety warning you added
```

</details>

### MEM-08: Periodically self-clean memory instead of letting it rot forever

Memory quality depends on what gets removed as much as what gets added.

Over time, `MEMORY.md` collects duplicates, stale facts, old preferences, and contradictions. OpenClaw's own template guidance already suggests a maintenance pass every few days: read recent `memory/YYYY-MM-DD.md` files, keep the significant lessons, update `MEMORY.md`, and remove outdated information that is no longer true.

That is the right mental model. Daily memory files are raw notes. `MEMORY.md` is curated wisdom. If everything stays forever, retrieval gets noisier and the model starts pulling stale context back into live work.

The fix is simple: review memory periodically, merge duplicates, resolve contradictions, remove outdated facts, and keep `MEMORY.md` focused on what is still worth knowing.

For example, this is the maintenance loop the docs recommend:

```md
1. Read through recent `memory/YYYY-MM-DD.md` files
2. Identify significant events, lessons, or insights worth keeping long-term
3. Update `MEMORY.md` with distilled learnings
4. Remove outdated info from `MEMORY.md` that's no longer relevant
```

For this one, heartbeat is usually the best fit. OpenClaw's own template puts memory maintenance under heartbeats, which makes sense: it is periodic background awareness, not a precise standalone job.

That can be as simple as adding a maintenance rule like this to `HEARTBEAT.md`:

```md
Every few days:
- Read recent `memory/YYYY-MM-DD.md` files
- Promote durable lessons to `MEMORY.md`
- Remove outdated entries from `MEMORY.md`
- Reply `NO_REPLY` if nothing needs updating
```

<p align="center">
  <img src="./tips/mem-08/heartbeat-memory-maintenance.png" alt="HEARTBEAT.md with a memory maintenance section added" width="100%" />
</p>

If you want exact timing or a fully isolated cleanup run, a cron job is still fine. But heartbeat is the more natural default for this tip.

Good memory is not just persistent. It is maintained.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Set up a practical memory-maintenance workflow for my OpenClaw workspace so `MEMORY.md` stays useful instead of slowly filling with stale facts.

Do all of the following:

1. Review my recent `memory/YYYY-MM-DD.md` files and my current `MEMORY.md`.
2. Identify duplicates, stale facts, contradictions, outdated preferences, and notes that should be promoted from daily memory into long-term memory.
3. Update `MEMORY.md` so it keeps the durable facts, decisions, preferences, and lessons that still matter.
4. Remove or rewrite outdated entries in `MEMORY.md` instead of letting conflicting versions pile up.
5. Add a short memory-maintenance rule to `HEARTBEAT.md` so this gets reviewed periodically in the normal heartbeat flow.
6. If heartbeat is not the right fit for my setup, explain why and suggest a dedicated cron instead.
7. Keep the process aligned with normal OpenClaw memory conventions: daily files are raw notes, `MEMORY.md` is curated memory.

Then show me:
- what you reviewed
- what you added to `MEMORY.md`
- what you removed or rewrote
- any contradictions or stale entries you found
- the exact `HEARTBEAT.md` rule you added
- whether you used heartbeat or recommended cron instead
```

</details>
