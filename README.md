<div align="center">
<img src="./assets/cover.png" alt="OpenClaw Tips cover" width="15%" />

# Awesome OpenClaw Tips
<p>
  <a href="https://www.reddit.com/r/OpenClaw_Tips/">
    <img src="https://img.shields.io/badge/Subreddit-r%2FOpenClaw__Tips-FF4500?logo=reddit&logoColor=white" alt="Subreddit: r/OpenClaw_Tips" />
  </a>
</p>
<p>
  <a href="https://boringdystopia.ai/"><img src="https://img.shields.io/badge/boringdystopia.ai-111111?style=for-the-badge&logo=vercel&logoColor=white" alt="boringdystopia.ai" /></a>&nbsp;
  <a href="https://x.com/alvinunreal"><img src="https://img.shields.io/badge/X-@alvinunreal-000000?style=for-the-badge&logo=x&logoColor=white" alt="X @alvinunreal" /></a>&nbsp;
  <a href="https://t.me/boringdystopiadevelopment"><img src="https://img.shields.io/badge/Telegram-Join%20channel-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram Join channel" /></a>
</p>
<br />
<strong>The practical playbook for turning OpenClaw from a fun chatbot into a reliable operating system for recurring work.</strong>
<p>These tips were gathered from hands-on use, docs, community setups, and repo deep-dives; see <a href="#acknowledgements">Acknowledgements</a>.</p>
</div>

## Table of Contents

- [💬 Messages](#messages)
  - [MES-01: Enable ack reactions by setting messages.ackReactionScope](#mes-01-enable-ack-reactions-by-setting-messagesackreactionscope)
- [📨 Telegram](#telegram)
  - [TEL-01: Use Telegram inline buttons for recurring actions](#tel-01-use-telegram-inline-buttons-for-recurring-actions)
  - [TEL-02: Split conversations into threads so context stops bleeding across topics](#tel-02-split-conversations-into-threads-so-context-stops-bleeding-across-topics)
  - [TEL-03: Set a system prompt per Telegram topic so /new resets noise without losing purpose](#tel-03-set-a-system-prompt-per-telegram-topic-so-new-resets-noise-without-losing-purpose)
  - [TEL-04: Give OpenClaw its own Telegram topic for fast admin work](#tel-04-give-openclaw-its-own-telegram-topic-for-fast-admin-work)
- [🧠 Memory](#memory)
  - [MEM-01: Make your agent learn from its mistakes](#mem-01-make-your-agent-learn-from-its-mistakes)
  - [MEM-02: Flush important state before compaction eats it](#mem-02-flush-important-state-before-compaction-eats-it)
  - [MEM-03: Use SQLite memory search before you pay for embeddings](#mem-03-use-sqlite-memory-search-before-you-pay-for-embeddings)
  - [MEM-04: Treat chat history as cache, not the source of truth](#mem-04-treat-chat-history-as-cache-not-the-source-of-truth)
  - [MEM-05: Periodically self-clean memory instead of letting it rot forever](#mem-05-periodically-self-clean-memory-instead-of-letting-it-rot-forever)
- [🛡️ Reliability](#reliability)
  - [REL-01: Don't put all your fallbacks on the same provider](#rel-01-dont-put-all-your-fallbacks-on-the-same-provider)
  - [REL-02: Your agent says "done" when it isn't](#rel-02-your-agent-says-done-when-it-isnt)
  - [REL-03: Use heartbeat to rotate recurring checks, not just repeat one generic check](#rel-03-use-heartbeat-to-rotate-recurring-checks-not-just-repeat-one-generic-check)
  - [REL-04: Turn on tool-loop detection before a bad run burns hours](#rel-04-turn-on-tool-loop-detection-before-a-bad-run-burns-hours)
- [💸 Cost](#cost)
  - [COST-01: Your heartbeat model is costing you more than you think](#cost-01-your-heartbeat-model-is-costing-you-more-than-you-think)
  - [COST-02: Use cache-ttl pruning or idle sessions will re-cache junk history](#cost-02-use-cache-ttl-pruning-or-idle-sessions-will-re-cache-junk-history)
  - [COST-03: Local models are often a false economy](#cost-03-local-models-are-often-a-false-economy)
  - [COST-04: Use local models only for repetitive mechanical work](#cost-04-use-local-models-only-for-repetitive-mechanical-work)
- [⚙️ Operations](#operations)
  - [OPS-01: Set explicit concurrency limits for agents and subagents](#ops-01-set-explicit-concurrency-limits-for-agents-and-subagents)
  - [OPS-02: Make the workspace folder the source of truth and put it under git](#ops-02-make-the-workspace-folder-the-source-of-truth-and-put-it-under-git)
  - [OPS-03: Learn the slash commands that actually save bad sessions](#ops-03-learn-the-slash-commands-that-actually-save-bad-sessions)
  - [OPS-04: Delete the old session on /new so resets do not leave junk behind](#ops-04-delete-the-old-session-on-new-so-resets-do-not-leave-junk-behind)
  - [OPS-05: Add optional plugin tools with tools.alsoAllow](#ops-05-add-optional-plugin-tools-with-toolsalsoallow)
- [⏱️ Automation](#automation)
  - [AUTO-01: Standing orders define what, cron defines when](#auto-01-standing-orders-define-what-cron-defines-when)
  - [AUTO-02: Use isolated cron jobs for noisy chores](#auto-02-use-isolated-cron-jobs-for-noisy-chores)
  - [AUTO-03: Back up your workspace continuously, not just once](#auto-03-back-up-your-workspace-continuously-not-just-once)
- [🏗️ Architecture](#architecture)
  - [ARCH-01: Stop using one generic agent for everything](#arch-01-stop-using-one-generic-agent-for-everything)
  - [ARCH-02: Keep your orchestrator as a manager, not the doer](#arch-02-keep-your-orchestrator-as-a-manager-not-the-doer)
  - [ARCH-03: Give different models different prompt files](#arch-03-give-different-models-different-prompt-files)
  - [ARCH-04: Predefine subagent workspaces or they lose shared context](#arch-04-predefine-subagent-workspaces-or-they-lose-shared-context)

<a id="messages"></a>

## 💬 Messages

### MES-01: Enable ack reactions by setting `messages.ackReactionScope`

<table width="100%">
  <tr>
    <td width="58%" valign="top">
      <p>Ack reactions are controlled by <code>messages.ackReactionScope</code>. If you want acknowledgements to appear more broadly, set the scope explicitly instead of relying on the default.</p>
      <p>Use <code>all</code> when you want broad ack reactions across chats instead of narrower behavior like direct messages only or group mentions only.</p>
      <p>Set it like this:</p>
      <pre lang="json5"><code>{
  messages: {
    ackReactionScope: "all"
  }
}</code></pre>
      <p>Valid values are <code>group-mentions</code>, <code>group-all</code>, <code>direct</code>, <code>all</code>, <code>off</code>, and <code>none</code>.</p>
    </td>
    <td width="42%" valign="top">
      <img src="./tips/mes-01/ack-reactions.png" alt="Telegram message showing ack reactions on a user message" width="100%" />
    </td>
  </tr>
</table>

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw config and enable ack reactions by setting `messages.ackReactionScope` explicitly.

Do all of the following:

1. Find my OpenClaw config file.
2. Check whether `messages.ackReactionScope` is already set.
3. If it is missing, explain the available values:
   - `group-mentions`
   - `group-all`
   - `direct`
   - `all`
   - `off`
   - `none`
4. Unless I want a narrower behavior, recommend `messages.ackReactionScope = "all"`.
5. After I choose, update the config carefully.

Then show me:
- which config file you changed
- the exact `messages` block before and after
- what `messages.ackReactionScope` is set to now
- what the selected scope means
- any assumptions you made
```

</details>

<a id="telegram"></a>

## 📨 Telegram

### TEL-01: Use Telegram inline buttons for recurring actions

<table width="100%">
  <tr>
    <td width="58%" valign="top">
      <p>If Telegram users have to keep typing the same replies, approvals, or short commands, the workflow gets slower than it needs to be. OpenClaw supports Telegram inline buttons, so recurring actions can be one tap instead of another typed message.</p>
      <p>The important distinction is that plain text option lists are not inline buttons. For real clickable Telegram buttons, the message must include a real inline-keyboard payload.</p>
      <p>This is a good fit for approvals and review flows. It also works well for quick replies and common follow-up actions. Use it anywhere repeated choices are clearer as taps than typed messages.</p>
    </td>
    <td width="42%" valign="top">
      <img src="./tips/tel-01/telegram-inline-buttons.png" alt="Telegram inline buttons rendered as real clickable buttons in chat" width="100%" />
    </td>
  </tr>
</table>

<p>Turn on inline buttons with Telegram capability scope:</p>
<pre lang="json5"><code>{
channels: {
  telegram: {
    capabilities: {
      inlineButtons: "all"
    }
  }
}
}</code></pre>
<p>The supported scopes are <code>off</code>, <code>dm</code>, <code>group</code>, <code>all</code>, and <code>allowlist</code>.</p>
<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw Telegram setup and enable inline buttons for recurring actions where taps are better than typed replies.

Do all of the following:

1. Find the active OpenClaw config file actually used by this runtime.
2. Check whether Telegram is configured and currently active.
3. Identify which Telegram account is being used for this chat/test.
4. Check whether channels.telegram.capabilities.inlineButtons is already set.
5. Unless there is a clear reason to limit scope, set: `channels.telegram.capabilities.inlineButtons = "all"`
6. Preserve any existing Telegram settings that are unrelated.
7. Do not treat plain-text option lists as buttons.
8. For real clickable Telegram buttons, send a message using an actual inline keyboard payload.
9. Use OpenClaw CLI in this form: `openclaw message send --channel telegram --account <accountId> --target <chatId> --message "<text>" --buttons '<json>'`
10. Ensure the --buttons payload is:
  - valid JSON
  - top-level array of rows
  - each row an array of button objects
  - each callback button includes text and callback_data
11. If a style field is supported by tooling, treat it only as a hint. Do not rely on Telegram per-button colors.
12. After configuration, send a real test message with clickable inline buttons.
13. Wait for at least one button click if possible, or clearly state if callback verification could not be completed.
14. Do not claim success unless the buttons were actually rendered as Telegram inline buttons.
15. Add this information in learnings/memory.

Then report back with:
- the exact config file changed
- the exact config value before and after for channels.telegram.capabilities.inlineButtons
- whether Telegram was already active
- which Telegram account was used
- which chat ID / target was tested
- the exact command used to send the test message
- whether the buttons rendered as real clickable inline buttons
- whether at least one callback click was received successfully
- any assumptions made
- any follow-up recommendation for recurring-action button patterns
```

</details>

### TEL-02: Split conversations into threads so context stops bleeding across topics

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

### TEL-03: Set a system prompt per Telegram topic so `/new` resets noise without losing purpose

Telegram topics already isolate session history. Add a topic-specific `systemPrompt` and each thread can keep its own durable purpose too.

This works well when one topic is for coding, another is for project operations, and another is for a specific client or team. Users can run `/new` inside the topic to clear the session, but the topic-specific prompt still loads again so the thread does not forget what it is for.

<p align="center">
  <img src="./tips/tel-02/telegram-topic-id.png" alt="Telegram chat showing the current topic id 1399171" width="49%" />
  <img src="./tips/tel-02/telegram-topic-prompt-after-new.png" alt="Telegram topic still answering with its configured purpose after running /new" width="49%" />
</p>

<table width="100%">
  <tr>
    <td width="100%" valign="top">
      <p>Use a topic-level override under the Telegram chat entry:</p>
      <pre lang="json5"><code>{
  channels: {
    telegram: {
      groups: {
        "-1001234567890": {
          topics: {
            "1399171": {
              systemPrompt: "This topic is for showcasing awesome-openclaw-tips example how to set contexts per Telegram thread via system prompts"
            }
          }
        }
      }
    }
  }
}</code></pre>
      <p>Topic entries can also override keys like <code>agentId</code>, <code>skills</code>, and <code>requireMention</code>. Keep the thread-specific purpose in <code>systemPrompt</code> and keep broader defaults at the chat or group level.</p>
      <p>If your Telegram setup is nested per account, apply the same topic override at that account's Telegram chat entry instead of the shared default path.</p>
    </td>
  </tr>
</table>

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw Telegram setup and give one or more Telegram topics a thread-specific system prompt so `/new` can reset the chat without losing the topic's purpose.

Do all of the following:

1. Find the active OpenClaw config file actually used by this runtime.
2. Check whether Telegram topic support is already configured for the relevant chat or account.
3. Identify the exact Telegram chat id and topic/thread id I want to configure.
4. Add or update a topic-specific `systemPrompt` at the correct Telegram topic config entry.
5. Preserve existing group-level or account-level Telegram settings that should still act as defaults.
6. If there is already a topic-specific override for that thread, merge carefully instead of overwriting unrelated keys.
7. Explain that `/new` resets the session history for that topic, but the topic config still applies on the next run.
8. If appropriate, suggest whether this topic should also override `agentId`, `skills`, or `requireMention`.
9. Test the setup in that topic if possible:
   - ask for the current topic id
   - run `/new`
   - ask what the topic is for
10. Do not claim success unless the configured topic prompt is still reflected after the reset.

Then show me:
- which config file you changed
- the exact Telegram topic config block before and after
- which chat id and topic/thread id were configured
- the exact `systemPrompt` now used for that topic
- whether `/new` was tested successfully in that topic
- any assumptions you made
```

</details>

### TEL-04: Give OpenClaw its own Telegram topic for fast admin work

If OpenClaw config changes, repo checks, cron issues, and bot maintenance all happen in the same general chat, operational work gets mixed into everything else. A dedicated Telegram topic with its own `systemPrompt` gives OpenClaw a standing admin lane for config review, source inspection, and safe git follow-up.

This works well for things like checking repo status, reviewing changed files, suggesting `.gitignore` updates, or preparing commits for your OpenClaw config workspace without dragging product or client chatter into the same thread.

<p align="center">
  <img src="./tips/tel-03/telegram-openclaw-admin-topic.png" alt="Dedicated Telegram topic used for OpenClaw admin work like repo review and commit follow-up" width="72%" />
</p>

<p>Use a topic-specific prompt under the exact Telegram account and chat path you already use. For account-nested Telegram config, it can look like this:</p>
<pre lang="json5"><code>{
  channels: {
    telegram: {
      max: {
        enabled: true,
        direct: {
          "*": {
            topics: {
              "1398645": {
                systemPrompt: "This is the OpenClaw admin topic. In this topic, manage my OpenClaw config, inspect OpenClaw source when needed, review repo status, suggest what should be committed or ignored, and ask before making git commits. OpenClaw source code is in ~/.openclaw/ and my global config is in ~/.openclaw/openclaw.json. I do clean, git management of openclaw directory, trying to ingore not for source code useful stuff, and include everything for reproducable re-setup. Usually after making changes, I commit my config dir, for this you can report to me changed files, what's good to commit and what's to ignore, if igoring should we add in .gitinore too and if I approve, you can commit"
              }
            }
          }
        }
      }
    }
  }
}</code></pre>

<p>Keep the prompt narrow and operational. Tell the topic what it is for, where the OpenClaw repo lives, where the active config lives, and what commit behavior you want. If you want approval before commits or `.gitignore` changes, say that directly in the topic prompt.</p>

<p>This is different from a generic project topic. The point is to have one permanent thread that OpenClaw treats as its own maintenance console.</p>

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw Telegram setup and create a dedicated Telegram topic for OpenClaw admin work so I can manage config and repo changes quickly without mixing that work into other chats.

Do all of the following:

1. Find the active OpenClaw config file actually used by this runtime.
2. Check which Telegram account and chat path this conversation uses.
3. Identify the exact topic/thread id I want to dedicate to OpenClaw admin work.
4. Add or update a topic-specific `systemPrompt` at the correct Telegram config path for that topic.
5. Keep unrelated Telegram settings intact.
6. Make the prompt explicitly cover:
   - OpenClaw config review
   - OpenClaw source inspection when needed
   - repo status checks
   - recommendations for what to commit vs ignore
   - asking for approval before commits or `.gitignore` changes unless I said otherwise
7. Include the real important paths in the prompt, such as my OpenClaw repo path and active config path.
8. If this setup is account-nested, apply the change under the correct account entry instead of the shared default path.
9. Test the topic if possible by asking for repo status or config status inside that topic.
10. Do not claim success unless the topic is configured and the behavior reflects the topic-specific prompt.

<systemPrompt>
This is the OpenClaw admin topic. In this topic, manage my OpenClaw config, inspect OpenClaw source when needed, review repo status, suggest what should be committed or ignored, and ask before making git commits. OpenClaw source code is in ~/.openclaw/ and my global config is in ~/.openclaw/openclaw.json. I do clean, git management of openclaw directory, trying to ingore not for source code useful stuff, and include everything for reproducable re-setup. Usually after making changes, I commit my config dir, for this you can report to me changed files, what's good to commit and what's to ignore, if igoring should we add in .gitinore too and if I approve, you can commit
</systemPrompt>

Then show me:
- which config file you changed
- the exact Telegram topic config block before and after
- which Telegram account, chat id, and topic/thread id were configured
- the exact `systemPrompt` now used for that topic
- whether you tested it in that topic
- any assumptions you made
```

</details>



<a id="memory"></a>

## 🧠 Memory

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

<table width="100%">
  <tr>
    <td width="58%" valign="top">
      <p>Most personal OpenClaw setups do not need a vector database just to find old notes. A local SQLite index with FTS5 is often enough.</p>
      <p>This tip ships with supporting files in <code>tips/mem-03/</code>.</p>
      <p>Build the database:</p><code>node tips/mem-03/rebuild-db.js</code>
      <p>Search it:</p><code>node tips/mem-03/relevant-memory.js "query about previous work"</code>
      <p>The scripts scan markdown files, build a SQLite database, and use full-text search to surface likely matches quickly. No API costs, no embedding pipeline, no external service.</p>
    </td>
    <td width="42%" valign="top">
      <img src="./tips/mem-03/sqlite-memory-search.png" alt="SQLite memory search returning relevant matches in Telegram" width="100%" />
    </td>
  </tr>
</table>

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

### MEM-05: Periodically self-clean memory instead of letting it rot forever

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

<a id="reliability"></a>

## 🛡️ Reliability

### REL-01: Don't put all your fallbacks on the same provider

When one provider rate-limits or goes down, every model behind that provider can fail together. If your entire fallback chain lives inside one vendor, that is not redundancy.

Bad:

```json
"primary": "openai/gpt-5",
"fallbacks": [
  "openai/gpt-5-mini",
  "openai/gpt-5-nano"
]
```

Better:

```json
"primary": "openai/gpt-5",
"fallbacks": [
  "kimi-coding/k2p5",
  "synthetic/hf:zai-org/GLM-4.7",
  "openrouter/google/gemini-3-flash-preview"
]
```

The point is not those exact providers. The point is failure independence. A limit or outage in one stack should not take your whole agent down with it.

The default shared path is `agents.defaults.model.fallbacks`. If one agent needs its own fallback chain, OpenClaw also supports a per-agent override in `agents.list[].model = { primary, fallbacks }`.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw model fallback setup and help me choose a provider-diverse fallback chain before changing anything.

Do all of the following:

1. Find my current OpenClaw model configuration.
2. Determine whether my setup currently uses shared fallbacks in `agents.defaults.model.fallbacks`, per-agent fallbacks in `agents.list[].model.fallbacks`, or both.
3. Check which providers are currently available in my setup.
4. Research or inspect the currently available models from those providers and identify good fallback candidates.
5. Check whether my current primary model and fallbacks are too concentrated in one provider.
6. Propose a few provider-diverse fallback chains and recommend one, keeping the setup simple.
7. Keep my current primary model if it still makes sense, unless there is a clear reason to change it.
8. Explain the tradeoffs of the suggested options - reliability, cost, speed, and model quality.
9. Ask me to choose one of the suggested fallback chains before changing the config.
10. After I choose, update the config carefully in the correct place - shared defaults for global fallbacks, or `agents.list[].model.fallbacks` for a specific agent override.

Then show me:
- which config path is currently being used for fallbacks
- the config file you changed
- the exact primary and fallback models before
- the provider and model options you discovered
- the fallback chains you suggest
- which option you recommend and why
- after I choose, the exact config path and primary/fallback models after
```

</details>

### REL-02: Your agent says "done" when it isn't

One of the most common OpenClaw failures is fake completion. The agent acknowledges the task, says it is done, and never verifies whether anything actually happened.

Add this to `AGENTS.md`:

```md
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

This does not change what your agent can do. It changes what counts as finished.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Update my OpenClaw instructions so the agent does not report fake completion.

Do all of the following:

1. Find the right workspace instruction file, preferably `AGENTS.md`.
2. Add an explicit Execute-Verify-Report rule for every task.
3. Include these exact behavioral requirements:
   - execute the task, do not just acknowledge it
   - verify the result actually happened
   - report what was done and what was verified
   - retry once with an adjusted approach if execution fails
   - if it fails again, report the failure with a diagnosis
   - never fail silently
   - after 3 total attempts, escalate to the user
4. Merge with any existing task-execution rules instead of creating conflicting instructions.
5. Keep the final instruction block short, clear, and enforceable.

Then show me:
- which file you changed
- the exact rule block you added
- any existing rules you had to merge with
- any edge cases or ambiguities you noticed
```

</details>

### REL-03: Use heartbeat to rotate recurring checks, not just repeat one generic check

A generic heartbeat check can keep returning `HEARTBEAT_OK` while email sync is broken, calendar access expired, git is dirty, or a task queue has been stalled for hours.

OpenClaw already has a real `HEARTBEAT.md` pattern for periodic awareness. A practical way to get more value from it is to rotate through a few small recurring checks instead of repeating the same generic check every time.

The pattern is simple:

```md
Read `heartbeat-state.json`. Run whichever check is most overdue.

- Email: every 30 min (9 AM - 9 PM)
- Calendar: every 2 hours (8 AM - 10 PM)
- Tasks: every 30 min
- Git: every 24 hours
- System: every 24 hours (3 AM)

Process:
1. Load timestamps from `heartbeat-state.json`
2. Calculate which check is most overdue
3. Run only that check
4. Update timestamp
5. Report only if something is actionable
6. Otherwise return `HEARTBEAT_OK`
```

This works well when you want lightweight recurring coverage without creating a separate cron job for every single check.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Upgrade my OpenClaw heartbeat so it rotates through a few recurring checks instead of repeating one generic check.

Do all of the following:

1. Find my current `HEARTBEAT.md` setup.
2. Replace or merge it with a rotating checklist that runs the single most overdue recurring check on each heartbeat.
3. Create or update a `heartbeat-state.json` file to track the last successful run time for each check.
4. Keep the checks practical and low-noise. Only report when something needs attention. Otherwise return `HEARTBEAT_OK`.
5. Reuse my existing heartbeat structure if it already has useful checks.
6. Keep this as a heartbeat workflow unless I already have a better reason to use separate cron jobs for exact timing.
7. Explain briefly which parts are standard OpenClaw heartbeat behavior and which parts are the rotating-check pattern being added.

Then show me:
- what you changed in `HEARTBEAT.md`
- whether you created or updated `heartbeat-state.json`
- which checks will rotate
- what counts as an actionable report vs `HEARTBEAT_OK`
- whether you kept it as heartbeat or recommended cron for any specific check
```

</details>

### REL-04: Turn on tool-loop detection before a bad run burns hours

Repeated tool-call loops are one of the fastest ways to waste time and tokens in OpenClaw. An agent can keep cycling through the same tool pattern, make no progress, and keep spending until you stop it.

OpenClaw already has built-in loop detection for this, but the guard is disabled by default. It can detect repeated same-tool patterns, no-progress polling loops, and ping-pong behavior between repeated tool calls.

Start with the default thresholds and turn it on like this:

```json5
{
  tools: {
    loopDetection: {
      enabled: true,
      historySize: 30,
      warningThreshold: 10,
      criticalThreshold: 20,
      globalCircuitBreakerThreshold: 30,
      detectors: {
        genericRepeat: true,
        knownPollNoProgress: true,
        pingPong: true
      }
    }
  }
}
```

The docs recommend starting with `enabled: true` and leaving the defaults alone until you see a real reason to tune them. If you get false positives, raise thresholds or disable the specific detector causing trouble instead of turning the whole guard off.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw config and turn on tool-loop detection so bad tool-call loops do not burn time and tokens unchecked.

Do all of the following:

1. Find my OpenClaw config file.
2. Check whether `tools.loopDetection` is already configured.
3. If it is missing, add `tools.loopDetection` with OpenClaw's recommended starting setup:
   - `enabled = true`
   - `historySize = 30`
   - `warningThreshold = 10`
   - `criticalThreshold = 20`
   - `globalCircuitBreakerThreshold = 30`
   - `detectors.genericRepeat = true`
   - `detectors.knownPollNoProgress = true`
   - `detectors.pingPong = true`
4. If it already exists, merge carefully instead of overwriting unrelated settings.
5. Check whether any agent-specific `agents.list[].tools.loopDetection` overrides already exist.
6. Explain briefly what each threshold does and whether the current setup looks conservative or aggressive.
7. Keep the initial setup close to defaults unless there is a clear reason to tune it.

Then show me:
- which config file you changed
- the exact `tools.loopDetection` block before and after
- whether any agent-specific overrides exist
- what the thresholds mean in practice
- any assumptions you made
```

</details>

<a id="cost"></a>

## 💸 Cost

### COST-01: Your heartbeat model is costing you more than you think

Heartbeat runs are small, but they repeat all day. If they use the same expensive model as your main agent, that background traffic adds cost faster than most people expect.

OpenClaw lets you set a separate heartbeat model at `agents.defaults.heartbeat.model`.

Use a cheaper model for heartbeats:

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        model: "openai/gpt-5-nano"
      }
    }
  }
}
```

For most setups, heartbeat work is lightweight: check whether something needs attention, return `HEARTBEAT_OK`, or surface a short actionable update. That usually does not need your main high-cost model.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw heartbeat configuration and set a cheaper heartbeat-specific model if I am currently using an unnecessarily expensive one.

Do all of the following:

1. Find my OpenClaw config file.
2. Check whether `agents.defaults.heartbeat.model` is already set.
3. Check what my default main model is.
4. If heartbeat is using the same high-cost model as my main agent, suggest a cheaper heartbeat model and recommend one.
5. Keep the setup simple. Prefer changing only `agents.defaults.heartbeat.model` unless there is a clear reason to do more.
6. Explain briefly what heartbeat runs currently do in my setup and why a cheaper model is or is not appropriate.
7. After choosing the model, update the config carefully without overwriting unrelated heartbeat settings.

Then show me:
- which config file you changed
- the exact `agents.defaults.heartbeat` block before and after
- what model my main agent uses
- what model heartbeat used before
- what model heartbeat uses after
- why that change makes sense for cost and workload
```

</details>

### COST-02: Use cache-ttl pruning or idle sessions will re-cache junk history

After a session sits idle past the prompt-cache TTL, the next request can end up caching old tool-result history all over again. If those old tool results are large and no longer useful, that first post-idle request costs more than it needs to.

OpenClaw has a built-in config for this at `agents.defaults.contextPruning`. In `cache-ttl` mode, OpenClaw prunes old tool results from the in-memory prompt after the cache TTL window passes. It does not rewrite the session transcript on disk.

Turn it on like this:

```json5
{
  agents: {
    defaults: {
      contextPruning: {
        mode: "cache-ttl",
        ttl: "1h"
      }
    }
  }
}
```

This is mainly useful for Anthropic prompt caching behavior, including OpenRouter Anthropic models. It reduces the cache write on the first post-idle request by trimming old tool-result context before that request is sent.

If you use Anthropic `cacheRetention`, match the pruning TTL to that cache window when possible:

- `ttl: "5m"` pairs with `cacheRetention: "short"`
- `ttl: "1h"` pairs with `cacheRetention: "long"`

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw config and enable cache-ttl context pruning so idle sessions do not re-cache oversized tool-result history.

Do all of the following:

1. Find my OpenClaw config file.
2. Check whether `agents.defaults.contextPruning` is already configured.
3. If it is missing, add `agents.defaults.contextPruning` with:
   - `mode = "cache-ttl"`
   - `ttl = "1h"`
4. If it already exists, merge carefully instead of overwriting unrelated pruning settings.
5. Check whether I use Anthropic models directly or through OpenRouter Anthropic model refs.
6. If I already use `cacheRetention`, tell me whether the pruning TTL matches it well.
7. Explain briefly that this prunes old tool results from the in-memory prompt only, not from the on-disk session transcript.
8. Keep the final config minimal unless there is a clear reason to tune additional pruning settings.

Then show me:
- which config file you changed
- the exact `agents.defaults.contextPruning` block before and after
- whether this setup is relevant to my current providers/models
- whether the TTL matches my current cache behavior well
- any assumptions you made
```

</details>

### COST-03: Local models are often a false economy

Local models can look cheaper because the per-request API cost is zero. In practice, many OpenClaw setups pay for that elsewhere: expensive hardware, higher latency, weaker output, smaller context windows, or more operational work to keep the local stack reliable.

OpenClaw's local-model docs are clear that strong local setups are possible, but they are not lightweight. OpenClaw expects large context and strong resistance to prompt injection. The docs recommend high-end hardware and the largest model variant you can run. Small or heavily quantized local models increase the tradeoff.

That means local is usually not the default cost fix for OpenClaw. It makes more sense when you already have the hardware, have a strong privacy requirement, or are intentionally using a hybrid setup with hosted models still available as fallbacks.

If you do run local, keep the setup realistic:

- use the largest model you can run well
- keep hosted models available as fallbacks with `models.mode: "merge"`
- treat local as an infrastructure decision, not just a pricing trick

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw model setup and tell me whether moving more of it to local models would actually reduce total cost for my workload.

Do all of the following:

1. Find my current OpenClaw model configuration.
2. Check whether I already use any local providers such as Ollama, LM Studio, or another local OpenAI-compatible endpoint.
3. Check whether my current setup is hosted-only, local-only, or hybrid.
4. Explain the likely tradeoffs for my setup: API cost, hardware cost, latency, context window, output quality, and operational complexity.
5. If local looks like a poor fit, say so clearly.
6. If local could make sense, recommend a realistic shape such as hybrid hosted-primary with local fallback, or local-only for narrow workloads.
7. Do not change my config yet unless I ask you to after reviewing the recommendation.

Then show me:
- what model setup I use now
- whether I already have local-model support configured
- the main reasons local would or would not make sense for me
- the safest setup shape you recommend
- any assumptions you made
```

</details>

### COST-04: Use local models only for repetitive mechanical work

Local models make more economic sense when the work is repetitive, narrow, and tolerant of weaker output. That usually means chores like classification, tagging, sorting, extraction, and other mechanical steps that do not need your best reasoning model.

This fits OpenClaw's local-model guidance better than using local as a blanket replacement for your main agent. The docs emphasize large context, strong prompt-injection resistance, and full-size models for serious general-purpose use. That makes local more compelling for bounded low-risk workloads than for your primary high-quality assistant path.

In practice, the safe pattern is usually:

- keep your main agent on a stronger hosted model
- use local for repetitive background work or narrow helper tasks
- keep fallbacks available with `models.mode: "merge"` when local reliability matters

That way local handles cheap mechanical work, while your main assistant keeps the quality level needed for planning, synthesis, and higher-trust decisions.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw setup and tell me whether I should use local models for any repetitive mechanical work instead of trying to move my main agent fully local.

Do all of the following:

1. Find my current OpenClaw model configuration.
2. Identify which parts of my workflow are repetitive and mechanical versus which parts need stronger reasoning or higher output quality.
3. Check whether I already have any local-model provider configured.
4. If local models are available, recommend which narrow tasks they could handle safely.
5. If local models are not available, explain whether adding them would likely be worth it for my workload.
6. Prefer a hybrid recommendation when that is safer than moving the main agent fully local.
7. Do not change the config yet unless I ask you to after reviewing the recommendation.

Then show me:
- what model setup I use now
- which tasks look suitable for local models
- which tasks should stay on stronger hosted models
- whether a hybrid setup makes sense
- any assumptions you made
```

</details>

<a id="operations"></a>

## ⚙️ Operations

### OPS-01: Set explicit concurrency limits for agents and subagents

If you run multi-agent workflows, concurrency is one of the easiest ways to lose control of cost and runtime behavior. A stuck retry loop or aggressive subagent fan-out can keep multiple runs active at once unless you set deliberate limits.

OpenClaw gives you two separate caps:

- `agents.defaults.maxConcurrent` - max parallel main agent runs across sessions
- `agents.defaults.subagents.maxConcurrent` - max parallel subagent runs in the dedicated subagent lane

Subagent concurrency is a global setting. Do not put `maxConcurrent` under `agents.list[].subagents`; that per-agent block only supports subagent allowlists such as `subagents.allowAgents`.

Set them explicitly:

```json5
{
  agents: {
    defaults: {
      maxConcurrent: 3,
      subagents: {
        maxConcurrent: 8
      }
    }
  }
}
```

The main agent limit defaults to `1`. The subagent lane defaults to `8`. Even if those defaults are acceptable, setting them explicitly makes the intended safety limits clear and keeps later config changes from drifting.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw concurrency settings and set explicit safe limits for both main agent runs and subagent runs.

Do all of the following:

1. Find my OpenClaw config file.
2. Check whether `agents.defaults.maxConcurrent` is already set.
3. Check whether `agents.defaults.subagents.maxConcurrent` is already set.
4. If either value is missing, add explicit concurrency limits with sensible defaults under `agents.defaults`.
5. If values already exist, explain whether they look conservative, aggressive, or mismatched for normal use.
6. Do not add `maxConcurrent` under `agents.list[].subagents`; that key is invalid there.
7. Keep the config simple. Prefer changing only these concurrency keys unless there is a clear reason to do more.
8. Explain briefly that main-agent concurrency and subagent concurrency are separate global limits.
9. Merge carefully without overwriting unrelated config.

Then show me:
- which config file you changed
- the exact concurrency block before and after
- what the main agent concurrency limit is
- what the subagent concurrency limit is
- why those limits make sense for safety and cost control
- any assumptions you made
```

</details>

### OPS-02: Make the workspace folder the source of truth and put it under git

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

### OPS-03: Learn the slash commands that actually save bad sessions

When a session gets slow, bloated, or confused, the fix is often not another long prompt. OpenClaw already has slash commands for resetting, inspecting, stopping, compacting, switching models, and managing subagents.

The few that matter most in bad sessions are usually:

- `/new` - start a fresh session without dragging the old context along
- `/compact` - shrink the current session when you want to keep going
- `/usage` - inspect token or cost burn instead of guessing
- `/stop` - stop a bad run before it wastes more time or tokens
- `/model` - switch models when the current path is a poor fit
- `/subagents` - inspect or control subagent runs when delegation gets messy

These are operational recovery tools, not trivia. If you use OpenClaw regularly, knowing this small set saves more time than trying to rescue every bad session with another prompt.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw setup and create a short cheat sheet of the slash commands that are most useful for recovering bad sessions.

Do all of the following:

1. Check which slash commands are available in my current OpenClaw setup.
2. Pick the small set that is most useful for slow, bloated, stuck, or confused sessions.
3. Include at least these when available: `/new`, `/compact`, `/usage`, `/stop`, `/model`, and `/subagents`.
4. Write a short cheat sheet that explains when to use each command.
5. Save that cheat sheet in a durable place I already use, such as `AGENTS.md`, `README.md`, or another existing workspace note.
6. Keep it short and practical instead of listing every command.

Then show me:
- which file you added the cheat sheet to
- the exact cheat-sheet section
- which commands were available in my setup
- any assumptions you made
```

</details>

### OPS-04: Delete the old session on `/new` so resets do not leave junk behind

`/new` starts a fresh session, but that does not automatically mean the old session record and transcript disappear from disk. If you reset often, old sessions can keep accumulating in `sessions.json` and the `sessions/` folder even though the live chat already moved on.

OpenClaw internal hooks are enough to clean this up. Turn on the built-in hook entry and add a handler at `hooks/delete-session-on-new/handler.ts` that removes the previous session entry when `/new` runs. If you still want a recovery path, archive the transcript instead of hard-deleting it.

Turn on the hook like this:

```json5
{
  hooks: {
    internal: {
      enabled: true,
      entries: {
        "delete-session-on-new": {
          enabled: true
        }
      }
    }
  }
}
```

This repo includes a working example handler in `tips/mem-09/handler.ts`.

The practical behavior is:

- intercept `/new`
- find the previous session entry being reset
- remove that session key from `sessions/sessions.json`
- move the transcript into `sessions/archive/` instead of losing it completely

That keeps `/new` closer to what many people expect: a real reset for live work, without silently growing stale session state forever.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw setup and make `/new` clean up the previous session instead of letting old session records pile up.

Use this helper file from this repo:
- `tips/mem-09/handler.ts`

If needed, fetch it directly from:
- https://raw.githubusercontent.com/alvinunreal/awesome-openclaw-tips/main/tips/mem-09/handler.ts

Do all of the following:

1. Find the active OpenClaw config file actually used by this runtime.
2. Check whether `hooks.internal` is already enabled.
3. Enable this hook entry without overwriting unrelated hook settings:
   - `hooks.internal.enabled = true`
   - `hooks.internal.entries.delete-session-on-new.enabled = true`
4. Create or update `hooks/delete-session-on-new/handler.ts` using the helper file.
5. Make sure the handler only runs for the `/new` command.
6. Make sure it removes the previous session entry, not the fresh replacement session.
7. Archive the old transcript into `sessions/archive/` instead of hard-deleting it, unless I explicitly want permanent deletion.
8. Test the behavior if possible by creating a fresh session, running `/new`, and confirming the old session entry no longer remains active in the session store.
9. Do not claim success unless you verified that the old session was cleaned up or clearly explain what blocked verification.

Then show me:
- which config file you changed
- the exact hook config block before and after
- whether `hooks/delete-session-on-new/handler.ts` was created or updated
- whether the old session was deleted from the session store
- whether the transcript was archived or deleted
- any assumptions you made
```

</details>

### OPS-05: Add optional plugin tools with `tools.alsoAllow`

Optional plugin tools can be installed and still stay invisible to the agent if the tool policy does not include them. The common mistake is setting `tools.allow` to only the new tool name. That switches the setup into restrictive allowlist mode and can remove normal profile tools you expected to keep.

OpenClaw's tool policy has an additive option for this case: `tools.alsoAllow`. It lets you keep the normal profile and add only the optional plugin tools you want.

For example, a coding-profile setup that installs TweetClaw can keep the usual coding tools and add the two TweetClaw tools like this:

```json5
{
  tools: {
    profile: "coding",
    alsoAllow: ["explore", "tweetclaw"]
  }
}
```

Use `tools.allow` when you intentionally want a strict allowlist. Use `tools.alsoAllow` when the goal is "keep my normal profile, plus this plugin tool."

After changing the config, verify both sides:

```bash
openclaw plugins inspect tweetclaw --runtime
openclaw config get tools
```

The first command checks that the plugin registered its tools. The second command checks whether your active policy can expose them to the agent.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw tool policy and add optional plugin tools without breaking the normal tool profile.

Do all of the following:

1. Find the active OpenClaw config file actually used by this runtime.
2. Check `tools.profile`, `tools.allow`, `tools.alsoAllow`, and `tools.deny`.
3. Check whether I am trying to enable any optional plugin tools, such as `explore` and `tweetclaw` for TweetClaw.
4. If I want to keep the normal profile and add plugin tools, use `tools.alsoAllow` instead of replacing the profile with `tools.allow`.
5. Preserve existing `tools.profile` and unrelated tool settings.
6. Only use `tools.allow` if I explicitly want strict allowlist mode.
7. If the plugin has per-agent config, also check `agents.list[].tools.alsoAllow` for that agent.
8. Verify the plugin runtime registration with `openclaw plugins inspect <plugin-id> --runtime` when possible.
9. Verify the effective config with `openclaw config get tools`.
10. If a tool is still missing, report whether the problem is plugin registration, config policy, or a stale gateway that needs restart.

Then show me:
- which config file you changed
- the tool policy before and after
- which optional plugin tools were added
- whether `tools.allow` was left alone or changed
- whether runtime inspection found the plugin tools
- any restart or reinstall step that is still needed
```

</details>

<a id="automation"></a>

## ⏱️ Automation

### AUTO-01: Standing orders define what, cron defines when

Standing orders and cron jobs solve different problems. Standing orders define what the agent is authorized and expected to do. Cron defines when that work should run.

OpenClaw's standing-orders docs recommend keeping the standing instructions in `AGENTS.md` so they are loaded every session. Cron jobs should then trigger that program on a schedule instead of repeating the whole workflow inside every scheduled prompt.

Keep the cron prompt short and point it at the standing order:

```bash
openclaw cron add \
  --name "Daily inbox triage" \
  --cron "0 8 * * 1-5" \
  --tz "America/New_York" \
  --session isolated \
  --message "Execute daily inbox triage per standing orders. Check mail for new alerts. Parse, categorize, and persist each item. Report summary to owner. Escalate unknowns." \
  --announce
```

This gives you one place to update the logic later. Change the standing order once in `AGENTS.md`, and the scheduled job keeps using the new behavior without rewriting every cron prompt.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw automation setup and separate standing instructions from scheduling so the logic lives in standing orders and cron only controls timing.

Do all of the following:

1. Find where my standing instructions currently live, preferably in `AGENTS.md`.
2. Check whether I already have cron jobs or scheduled prompts that duplicate long workflow instructions.
3. If the workflow logic is embedded directly in cron prompts, move the durable logic into a standing-order section.
4. Keep the standing-order instructions in `AGENTS.md` unless there is a clear reason to use another file and reference it carefully.
5. Rewrite the scheduled prompt so it is short and points to the standing order instead of repeating the full workflow.
6. Keep approval gates, escalation rules, and execution expectations clear in the standing order.
7. Preserve any existing schedule, timezone, delivery target, and safety behavior unless there is a clear problem.

Then show me:
- which file you changed for the standing order
- the exact standing-order block you added or updated
- which cron job or scheduled prompt you changed
- the exact scheduled prompt before and after
- what logic now lives in the standing order vs the cron job
- any assumptions you made
```

</details>

### AUTO-02: Use isolated cron jobs for noisy chores

Some scheduled jobs do not belong in your main chat history. Frequent background chores like inbox cleanup, status polling, or routine maintenance can create noise if they keep waking the main session.

OpenClaw supports isolated cron jobs for exactly this case. Isolated jobs run in a dedicated cron session instead of the main session, start with a fresh session id by default, and can announce a summary without dragging the full chore history into your main conversation.

Use isolated jobs when the work is noisy, frequent, or mostly background:

```bash
openclaw cron add \
  --name "Inbox cleanup" \
  --cron "*/15 * * * *" \
  --session isolated \
  --message "Clean up routine inbox noise and report only anything actionable." \
  --announce
```

This keeps the recurring job in its own `cron:<jobId>` session. It is a better fit than a main-session job when the task should stay in the background and only surface a useful summary.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw cron jobs and move noisy background chores to isolated cron sessions when they should not pollute the main session history.

Do all of the following:

1. Find my current OpenClaw cron jobs.
2. Identify any scheduled jobs that are noisy, frequent, or mostly background work.
3. Check whether those jobs currently run in the main session instead of isolated cron sessions.
4. For jobs that should stay out of the main chat history, convert them to isolated cron jobs.
5. Keep or set delivery behavior appropriately so I still get useful summaries when needed.
6. Explain which jobs should stay main-session and which should be isolated.
7. Preserve existing schedules unless there is a clear problem.

Then show me:
- which cron jobs you reviewed
- which jobs you moved to isolated sessions
- the exact cron job config or command before and after
- what delivery behavior each isolated job will use
- any assumptions you made
```

</details>

### AUTO-03: Back up your workspace continuously, not just once

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

<a id="architecture"></a>

## 🏗️ Architecture

### ARCH-01: Stop using one generic agent for everything

Once OpenClaw is doing more than one kind of work, one generic agent usually becomes a quality bottleneck. Monitoring, research, and communication do not need the same prompt, the same tools, or the same model behavior.

OpenClaw already has a real multi-agent pattern through `agents.list`, separate workspaces, and isolated sessions. That makes it practical to split distinct jobs into distinct agents instead of forcing one agent to do everything.

Start with a small split:

```json5
{
  agents: {
    list: [
      {
        id: "monitor",
        workspace: "~/.openclaw/workspace-monitor",
        model: { primary: "openai/gpt-5-nano" }
      },
      {
        id: "researcher",
        workspace: "~/.openclaw/workspace-researcher",
        model: { primary: "kimi-coding/k2p5" }
      },
      {
        id: "communicator",
        workspace: "~/.openclaw/workspace-communicator",
        model: { primary: "anthropic/claude-opus-4-6" }
      }
    ]
  }
}
```

The point is not those exact models. The point is role separation. Keep the monitor cheap and narrow, the researcher good at reading and comparing, and the communicator optimized for human-facing output.

Start with three roles, not twelve.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw setup and tell me whether I should split my current single-agent setup into a small multi-agent architecture with distinct roles.

Do all of the following:

1. Find my current OpenClaw agent configuration.
2. Check whether I already use `agents.list` or if I am still effectively single-agent.
3. Look at the kinds of work I expect this setup to do and identify whether there are clearly different roles such as monitoring, research, and communication.
4. If a split makes sense, propose a small role-based architecture with distinct agent ids, workspace names, and model suggestions.
5. Keep the recommendation conservative. Prefer 2-3 agents, not a large agent tree.
6. Explain what each proposed agent would own and why that separation would improve quality, cost, or reliability.
7. Do not change my config yet unless I ask you to after reviewing the recommendation.

Then show me:
- what agent setup I use now
- whether I already have multi-agent support configured
- the small architecture you recommend
- what each proposed agent would do
- what tradeoffs come with splitting the setup
- any assumptions you made
```

</details>

### ARCH-02: Keep your orchestrator as a manager, not the doer

In a multi-agent setup, the main orchestrator works best as a manager. Its job is to plan, route work, keep context straight, and report back. Once it starts trying to do every research task, coding task, and background chore itself, the system gets slower and less reliable.

This matches OpenClaw's multi-agent and delegate patterns. Separate agents can own different workspaces, sessions, and roles. That only helps if the top-level agent actually orchestrates instead of absorbing all the work itself.

The practical split looks like this:

- the orchestrator decides what needs to happen
- specialist agents do the bounded work
- the orchestrator collects results and reports the outcome

If the main agent is busy doing the work itself, it is not really orchestrating.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw setup and tell me whether my main agent should act more like an orchestrator that plans and delegates instead of trying to do all work itself.

Do all of the following:

1. Find my current OpenClaw agent setup.
2. Check whether I already have multiple agents or roles configured.
3. Look at the kinds of work my main agent is expected to handle and identify whether it is mixing orchestration with too much direct execution.
4. If a manager-style orchestrator makes sense, recommend what the main agent should keep doing directly and what should move to specialist agents.
5. Keep the recommendation practical. Prefer a small separation of responsibilities, not a complex hierarchy.
6. Explain how this would improve clarity, reliability, or cost control.
7. Do not change my config yet unless I ask you to after reviewing the recommendation.

Then show me:
- what my main agent is doing now
- whether it is acting more like a manager or a doer
- what work should stay with the main agent
- what work should move to specialist agents
- what tradeoffs come with this split
- any assumptions you made
```

</details>

### ARCH-03: Give different models different prompt files

Model switching is not just about cost or speed. Different models follow instructions differently, handle tone differently, and fail in different ways. If you rely on multiple important model paths, one shared prompt setup can leave quality on the table.

OpenClaw already gives you the main pieces needed for this: per-agent workspaces, per-agent model configuration, and separate workspace files injected into each agent's context. That makes it practical to keep different prompt variants for different agent/model paths instead of forcing one prompt style across everything.

The practical version is simple:

- keep one prompt/workspace setup for your main high-quality model path
- keep a separate prompt/workspace setup for cheaper, narrower, or more operational models
- tune each one for how that model actually behaves in practice

This does not mean creating a huge prompt matrix. It means separating the prompt setups that clearly need different instructions.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw setup and tell me whether I should keep different prompt/workspace files for different important model paths instead of using one shared prompt setup for everything.

Do all of the following:

1. Find my current agent and model configuration.
2. Check whether I already use multiple important model paths, such as a stronger main model and one or more cheaper or narrower models.
3. Look at the kinds of work those models handle and identify whether they likely need different instructions, tone, or operating rules.
4. If a split makes sense, recommend a small prompt/workspace separation strategy.
5. Keep the recommendation practical. Prefer a few clear prompt variants, not a large prompt matrix.
6. Explain what should stay shared across all prompt files and what should be tuned per model path.
7. Do not change my files yet unless I ask you to after reviewing the recommendation.

Then show me:
- what agent/model setup I use now
- which model paths look different enough to justify separate prompt setups
- what should stay shared vs what should be tuned per model path
- what tradeoffs come with keeping separate prompt files
- any assumptions you made
```

</details>

### ARCH-04: Predefine subagent workspaces or they lose shared context

Spawned agents do not automatically share your main workspace context. If you call `sessions_spawn` against an agent that is not predefined with an explicit workspace, OpenClaw can create a separate `workspace-<agentId>/` with its own empty `AGENTS.md`.

That means the spawned agent may miss the standing orders, memory files, and shared project context you assumed it would inherit.

The runbook recommendation is explicit: if you want shared context across spawned agents, predefine them in `agents.list` with explicit workspace paths.

For example:

```json5
{
  agents: {
    list: [
      {
        id: "researcher",
        workspace: "~/.openclaw/workspace"
      }
    ]
  }
}
```

If you do not want a shared workspace, that is fine too. The important part is to choose deliberately. Accidental empty workspaces are what cause confusing subagent results.

<details>
<summary><strong>Copy prompt - implement this tip for me</strong></summary>

```md
Review my OpenClaw subagent setup and make sure spawned agents use intentional workspace paths instead of accidentally running with empty default workspaces.

Do all of the following:

1. Find my current OpenClaw agent configuration.
2. Check whether I already define subagents in `agents.list` with explicit `workspace` paths.
3. Identify any spawned-agent workflow where shared context is expected.
4. If a spawned agent should share the main workspace context, recommend or add an explicit `workspace` path for that agent.
5. If a spawned agent should stay isolated, make that explicit too instead of relying on accidental defaults.
6. Explain which agents should share context and which should stay isolated.
7. Do not change unrelated agent settings while doing this.

Then show me:
- which config file you changed
- the exact agent block before and after
- which spawned agents now share workspace context
- which spawned agents stay isolated
- any assumptions you made
```

</details>

## Acknowledgements

- [digitalknk/openclaw-runbook](https://github.com/digitalknk/openclaw-runbook)
- [ucsandman/OpenClaw-Setup](https://github.com/ucsandman/OpenClaw-Setup)


<!-- TIP_APPEND_EOF: add new tip sections above this line only -->
