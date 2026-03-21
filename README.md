# Awesome OpenClaw tips

OpenClaw gets interesting once it stops feeling like a chatbot and starts feeling like an operating system for recurring work.

Many setups fail for the following reasons - cost drift, context bloat, weak memory, messy scheduling, unsafe defaults, too many agents, too much trust in chat history, not enough visibility into what the system is actually doing.

This is a list of best tips collected from various articles/posts, tested and approved.

---

## Categories

- `MEM` - memory, persistence, and context survival
- `REL` - reliability, verification, and keeping the system honest
- `COST` - cost control and model economics
- `ARCH` - agent design and role split
- `AUTO` - automation, standing orders, and scheduled execution
- `OPS` - operational guardrails and runtime limits

## Memory

## MEM-01: Make your agent learn from its mistakes

By default, every session starts clean. Your agent has no memory of the last time it tried something and failed, or the last time you corrected it. Two weeks in, it's still making the same mistakes you fixed on day three.

The fix is a `.learnings/` folder in your workspace with two files:

- `.learnings/ERRORS.md` - command failures, things that broke, exceptions
- `.learnings/LEARNINGS.md` - corrections you made, knowledge gaps, things it discovered

Then add this to your `SOUL.md`:

```
Before starting any task, check .learnings/ for relevant past errors.
When you fail at something or I correct you, log it to .learnings/ immediately.
```

That's the minimum. Over time, patterns that repeat get promoted into `SOUL.md` itself - so the lesson injects into every future session automatically without needing to be looked up each time.

For the full version with automatic hooks that trigger on command errors, a structured entry format with IDs, and a promotion workflow, install the [self-improving-agent skill](https://clawhub.ai/pskoett/self-improving-agent).

## MEM-02: Flush important state before compaction eats it

Long OpenClaw sessions do not keep growing forever. Once the context gets too full, Pi compacts it. That usually happens either after a context overflow or when `contextTokens > contextWindow - reserveTokens`.

The problem is that compaction only keeps a summary plus the recent part of the conversation. If a useful decision, project detail, or correction is sitting only in chat, it is now at risk of being reduced to a summary or dropped from the part that is actively in use.

Treat compaction as a deadline. Before it hits, important state should already be written to disk.

OpenClaw already has a built-in pre-compaction memory flush for embedded Pi sessions. Turn it on and keep it on:

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

What this does is watch session context usage, trigger a silent flush before hard compaction, and write durable state to the workspace so it survives the cleanup cycle. It only runs once per compaction cycle, and it uses `NO_REPLY`, so it does not spam the user.

This pairs with `MEM-01`. `.learnings/` is where durable mistakes and corrections should end up. The pre-compaction flush is what makes sure the important stuff actually gets there before the context gets squeezed.

Do not rely on raw chat history for anything worth keeping. Chat is working memory. Files are memory.

## MEM-03: Use SQLite memory search before you pay for embeddings

Most personal OpenClaw setups do not need a fancy vector database just to find old notes. A local SQLite index with FTS5 is often enough.

This repo includes a minimal version in `tools/memory-db/`.

The setup is simple:

```bash
node tools/memory-db/rebuild-db.js
```

Then search memory like this:

```bash
node tools/memory-db/relevant-memory.js "query about previous work"
```

The scripts scan markdown files, build a SQLite database, and use full-text search to pull back relevant memory quickly. No API costs, no embedding pipeline, no external service.

This works especially well as a first pass. Search the local index, get a short list of likely files, then read the actual markdown sources it points to. For most personal assistant use cases, that is good enough.

## MEM-04: Treat chat history as cache, not the source of truth

If you want real autonomy, stop treating the chat transcript like durable state. Chat is useful while the session is alive, but compaction, resets, and long-running drift make it a bad source of truth.

The safer pattern is to keep state and artifacts on disk, then make the agent reconstruct what to do next from files after any compaction or restart. If the system cannot recover its place from the workspace alone, it is more fragile than it looks.

This is the same reason `MEM-02` matters. Important things should survive the session, not just live inside it.

## MEM-05: Split conversations into threads so context stops bleeding across topics

One long OpenClaw conversation turns into a junk drawer. Coding, CRM, research, random questions, and status updates all get mixed together, and every new turn has to drag that baggage forward.

The fix is simple: split work by thread or channel. Keep one thread for coding, another for research, another for admin, another for personal operations. Focused threads give the agent focused context.

This is one of the easiest memory fixes because it does not require any new tooling. It just stops unrelated context from polluting the current task.

## MEM-06: Make the workspace folder the source of truth and put it under git

`AGENTS.md`, `SOUL.md`, `USER.md`, `HEARTBEAT.md`, `MEMORY.md`, and related files are not just notes. They are operating state.

Treat the workspace like the real brain of the system. Put it under git, ideally in a private repo, so changes to prompts, memory files, and operating rules are versioned and recoverable.

That gives you two things chat history does not: backup and diff. When the system gets worse, you can actually see what changed.

## MEM-07: Let the agent learn implicit triggers, not just explicit "remember this" phrases

The best memory systems do not wait for exact phrases like "remember this" or "note that". They also catch the things that obviously matter: decisions, corrections, recurring workflow rules, revealed preferences, and lessons from failures.

That means memory updates should trigger on moments like choosing X over Y, correcting an earlier assumption, establishing a new rule, or discovering what went wrong. Those are the moments that make later sessions smarter.

If memory only updates when the human says the magic words, a lot of the useful stuff never gets written down.

## MEM-08: Periodically self-clean memory instead of letting it rot forever

Memory quality does not just depend on what gets added. It also depends on what gets cleaned up.

Over time, memory files collect duplicates, stale facts, old preferences, and contradictions. That makes retrieval worse. The agent pulls back too much, trusts outdated notes, or has to work around two versions of the same truth.

The fix is simple: review memory periodically and clean it. Merge duplicate entries, resolve contradictions, remove stale items, and move outdated details into an archive section instead of letting them sit in active memory forever.

Good memory is not just persistent. It is maintained.

## Reliability

## REL-01: Don't put all your fallbacks on the same provider

When Claude's rate limit hits, every Claude model goes down at the same time - Opus, Sonnet, Haiku, all of them. Claude session limits reset every 5 hours or weekly depending on your plan. If your fallback chain is all Anthropic, that's a long outage.

```json
// this all fails together when OpenAI quota exhausts
"primary": "openai/gpt-5",
"fallbacks": [
  "openai/gpt-5-mini",
  "openai/gpt-5-nano"
]
```

Mix providers so something always keeps running:

```json
"primary": "openai/gpt-5",
"fallbacks": [
  "kimi-coding/k2p5",
  "synthetic/hf:zai-org/GLM-4.7",
  "openrouter/google/gemini-3-flash-preview"
]
```

The same logic applies to any provider - quotas exhaust, outages happen. The goal is that hitting a limit on one doesn't take down your whole setup.

## REL-02: Your agent says "done" when it isn't

The most common failure mode in OpenClaw is an agent that acknowledges a task without completing it. It says "I'll handle that" and moves on. Or it says "done" without checking if anything actually happened. You find out three hours later that nothing was sent, nothing was saved, nothing changed.

Add this block to your `AGENTS.md`:

```
Every task follows Execute-Verify-Report. No exceptions.

- Execute: do the actual work, not just acknowledge the instruction
- Verify: confirm the result happened (file exists, message delivered, data saved)
- Report: say what was done and what was verified

"I'll do that" is not execution.
"Done" without verification is not acceptable.
If execution fails, retry once with an adjusted approach.
If it fails again, report the failure with a diagnosis. Never fail silently.
3 attempts max, then escalate to the user.
```

This doesn't change what your agent does - it changes what counts as finished.

## REL-03: Rotate heartbeat checks instead of using one dumb alive ping

A basic heartbeat is almost useless once OpenClaw is doing real work. It can return `HEARTBEAT_OK` while email sync is broken, calendar access expired, git is dirty, or a task queue has been stalled for hours.

What works better is a rotating heartbeat. Each run does one real check - whichever is most overdue - and updates a state file:

```markdown
# HEARTBEAT.md

Read `heartbeat-state.json`. Run whichever check is most overdue.

- Email: every 30 min (9 AM - 9 PM)
- Calendar: every 2 hours (8 AM - 10 PM)
- Tasks: every 30 min
- Git: every 24 hours
- System: every 24 hours (3 AM)

Process:
1. Load timestamps from heartbeat-state.json
2. Calculate which check is most overdue
3. Run only that check
4. Update timestamp
5. Report only if something is actionable
6. Otherwise return HEARTBEAT_OK
```

This catches more failure modes, spreads the load across the day instead of firing everything every run, and keeps heartbeat cheap enough to stay on a low-cost model.

Heartbeat should mean "the system is still healthy", not just "the agent replied". If it only checks that the process is alive, it misses the failures that actually matter.

## Cost

## COST-01: Your heartbeat model is costing you more than you think

Heartbeats run roughly 48 times a day. Each one is a tiny check - read a file, verify a condition - but it fires constantly, forever, on whatever model you set as default.

On Sonnet that's ~$0.005 per heartbeat, $0.24/day, $87/year. Just to keep the session alive.

Set a cheap model specifically for heartbeats:

```json
"agents": {
  "defaults": {
    "heartbeat": {
      "model": "openai/gpt-5-nano"
    }
  }
}
```

GPT-5 Nano costs ~$0.0001 per heartbeat. Same 48 checks a day comes to $0.005/day. Heartbeats don't need intelligence - they need to run reliably and cheaply. Any fast, low-cost model works here.

## COST-02: Use cache-ttl pruning or idle sessions will re-cache junk history

Prompt caching only saves money if old context stops coming back after the session has been idle for a while. Without pruning, a session can sit for an hour, wake up again, and re-cache a pile of old tool results that no longer matter.

Turn on cache-ttl pruning:

```yaml
agents:
  defaults:
    contextPruning:
      mode: "cache-ttl"
      ttl: "1h"
```

What this does is prune old tool-result context after the cache TTL window passes. That keeps post-idle requests from paying to cache oversized history again.

This works especially well with prompt caching. Keep a longer-lived cache on the agents that actually benefit from it, then let `cache-ttl` trim the dead weight after idle gaps.

## COST-03: Local models are often a false economy

Local models get pitched as the answer to OpenClaw costs. Most of the time, they are not. The hardware needed to run serious models well is expensive, and the cheaper setups usually pay you back in latency, queueing, or degraded output.

The rough math is what kills the fantasy. A Mac Studio with 512 GB of unified memory and 2 TB of storage is over $9,000. To run something like Kimi 2.5 with usable performance, the number in the runbook is closer to two of them - roughly $18,000 in hardware.

That can make sense if you are building a business that genuinely needs the hardware for more than just OpenClaw. For most people, it does not. A few cents saved on API calls is not a win if the tradeoff is slower workflows and a giant upfront bill.

The same problem shows up with some free hosted options. They sound cheap until you see the queue. If a model is sitting behind 150+ requests, it is not really usable for an agent workflow that needs answers in seconds.

Local models are still useful for experimentation and repetitive low-stakes work. Just do not assume local automatically means cheaper. In practice, free and local often mean slower, and slower is its own cost.

## COST-04: Use local models only for repetitive mechanical work

Local models start making sense once the task is boring enough. Email sorting. Calendar parsing. Simple classification. Anything you do all day that follows a pattern and does not need much creativity.

That is where the economics flip. If a task happens 100 times a day, routing it through something local like Ollama can cut a large pile of API calls without hurting much. Save the paid models for the work that actually benefits from them.

The important part is to be honest about what local models are good at. They are usually not the best choice for strategy, writing, deep reasoning, or anything where quality matters more than volume. They are good at cheap, repetitive chores.

So the rule is not "use local models to save money." The rule is "use local models for the parts of the workflow that are mostly mechanical." That is where they help instead of slowing the whole system down.

## Architecture

## ARCH-01: Stop using one generic agent for everything

Better results usually come from not treating OpenClaw like one giant do-everything assistant. A monitor, a researcher, and a communicator should not have the same prompt, the same model, or the same job. When they share one identity, they become mediocre at all of it.

What works better is a small split with clear roles:

```json
{
  "agents": {
    "list": [
      {
        "id": "monitor",
        "model": {
          "primary": "openai/gpt-5-nano"
        }
      },
      {
        "id": "researcher",
        "model": {
          "primary": "kimi-coding/k2p5"
        }
      },
      {
        "id": "communicator",
        "model": {
          "primary": "anthropic/claude-opus-4-6"
        }
      }
    ]
  }
}
```

The monitor is cheap and boring on purpose. It checks status, logs, cron jobs, and reports only when something needs attention. The researcher reads, compares sources, and writes structured findings. The communicator drafts things that a human might actually send.

This also fixes a cost problem. Monitoring does not need an expensive model. Writing often does. Research sits somewhere in the middle. Once those jobs are separated, each one can use the cheapest model that is still good enough for that type of work.

Start with three roles, not twelve. That is enough to feel the benefit without creating a tiny org chart that now needs to be managed. If they are working reliably, then add more.

## ARCH-02: Keep your orchestrator as a manager, not the doer

The main agent works better as a manager than a worker. Its job is to plan, delegate, keep context straight, and report back. Once it starts trying to do every coding task, research job, and background chore itself, everything gets slower and more fragile.

That is the point of sub-agents and specialized roles. Let the orchestrator decide what needs to happen, then hand the actual work to the right agent. Planning, delegating, and reporting scale much better than stuffing everything into one session.

If the main agent is busy doing the work itself, it is not really orchestrating.

## ARCH-03: Give different models different prompt files

Model switching is not just about price or speed. Different models respond differently to the same instructions. Some do better with direct positive instructions. Others need firmer boundaries. Formatting preferences also vary more than people expect.

That means one shared prompt file is often leaving quality on the table. Keep separate prompt versions for the main models you rely on, then tune each one for how that model actually behaves.

The easiest way to drift into mediocre outputs is to assume all models interpret the same prompt the same way. They do not.

## Automation

## AUTO-01: Standing orders define what, cron defines when

Standing orders and cron jobs solve different parts of the problem. Standing orders define what the agent is allowed and expected to do. Cron defines when it runs.

That separation matters because it keeps scheduled prompts small and clean. The cron job should point at the standing order, not duplicate the whole workflow every time.

The pattern looks like this:

```bash
openclaw cron create \
  --name daily-inbox-triage \
  --cron "0 8 * * 1-5" \
  --tz America/New_York \
  --timeout-seconds 300 \
  --announce \
  --channel bluebubbles \
  --to "+1XXXXXXXXXX" \
  --message "Execute daily inbox triage per standing orders. Check mail for new alerts. Parse, categorize, and persist each item. Report summary to owner. Escalate unknowns."
```

This is cleaner than pasting the whole workflow into every scheduled job, and it gives you one place to update the logic later.

## Operations

## OPS-01: Set concurrency limits or one stuck task will drain your quota

OpenClaw has no concurrency cap by default. If a task gets stuck in a retry loop - or you kick off several subagents at once - they all run in parallel with nothing stopping them. A few minutes of that can burn through a day's quota.

Two lines in your config fix it:

```json
"agents": {
  "defaults": {
    "maxConcurrent": 4,
    "subagents": {
      "maxConcurrent": 8
    }
  }
}
```

`maxConcurrent: 4` means at most 4 agent tasks run at the same time. `subagents.maxConcurrent: 8` caps the total subagents spawned across all of them. If something goes wrong, the damage stays bounded.

The numbers above are a reasonable starting point. Bring them down if you're on a tight quota, up if you're running heavy parallel workloads and have headroom.

## OPS-02: Use a task manager so agent work stops being a black box

One of the most frustrating parts of running OpenClaw is not knowing what it is doing right now, what is stuck, and what needs your attention. Logs help, but they are a bad dashboard.

A task manager solves that. The exact tool does not matter much - Todoist, Linear, GitHub Projects, Notion, anything with an API can work. What matters is the state model: queue, active, blocked, done.

Once the agent writes its work into a system you already check, you get operational visibility without having to inspect transcripts or dig through logs. A glance should tell you what is moving, what is stalled, and what is waiting on you.
