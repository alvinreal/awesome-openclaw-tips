#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { DatabaseSync } from "node:sqlite"

const query = process.argv.slice(2).join(" ").trim()

if (!query) {
  console.error('Usage: node tools/memory-db/relevant-memory.js "your query"')
  process.exit(1)
}

const dbPath = path.join(process.cwd(), "tools", "memory-db", "memory.db")

if (!fs.existsSync(dbPath)) {
  console.error("memory.db not found. Run: node tools/memory-db/rebuild-db.js")
  process.exit(1)
}

const db = new DatabaseSync(dbPath, { readOnly: true })
const search = db.prepare(`
  SELECT path, title, snippet(memory_fts, 2, '[', ']', ' ... ', 16) AS snippet
  FROM memory_fts
  WHERE memory_fts MATCH ?
  ORDER BY rank
  LIMIT 5
`)

const rows = search.all(query)

if (rows.length === 0) {
  console.log(`No results for: ${query}`)
  process.exit(0)
}

console.log(`Top matches for: ${query}`)

for (const row of rows) {
  console.log(`\n- ${row.path}`)
  console.log(`  title: ${row.title}`)
  if (row.snippet) {
    console.log(`  match: ${row.snippet.replace(/\s+/g, " ").trim()}`)
  }
}
