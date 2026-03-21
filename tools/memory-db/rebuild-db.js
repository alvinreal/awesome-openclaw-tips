#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { DatabaseSync } from "node:sqlite"

const workspaceRoot = process.cwd()
const dbPath = path.join(workspaceRoot, "tools", "memory-db", "memory.db")
const ignoreDirs = new Set([".git", "node_modules", "dist", "build", ".next", ".nuxt"])
const markdownFiles = []

walk(workspaceRoot)

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new DatabaseSync(dbPath)
db.exec("DROP TABLE IF EXISTS files")
db.exec("DROP TABLE IF EXISTS memory_fts")
db.exec("CREATE TABLE files (path TEXT PRIMARY KEY, title TEXT, content TEXT)")
db.exec("CREATE VIRTUAL TABLE memory_fts USING fts5(path, title, content)")

const insertFile = db.prepare("INSERT INTO files (path, title, content) VALUES (?, ?, ?)")
const insertFts = db.prepare("INSERT INTO memory_fts (path, title, content) VALUES (?, ?, ?)")

for (const filePath of markdownFiles) {
  const content = fs.readFileSync(filePath, "utf8")
  const relativePath = path.relative(workspaceRoot, filePath)
  const title = extractTitle(content, relativePath)
  insertFile.run(relativePath, title, content)
  insertFts.run(relativePath, title, content)
}

console.log(`Indexed ${markdownFiles.length} markdown files into tools/memory-db/memory.db`)

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) {
        continue
      }
      walk(fullPath)
      continue
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      markdownFiles.push(fullPath)
    }
  }
}

function extractTitle(content, fallback) {
  const firstHeading = content.match(/^#\s+(.+)$/m)
  return firstHeading ? firstHeading[1].trim() : fallback
}
