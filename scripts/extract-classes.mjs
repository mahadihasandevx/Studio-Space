import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const classes = new Set();
for (const file of walk("src")) {
  const text = fs.readFileSync(file, "utf8");
  const regex = /className=(?:"([^"]*)"|\{`([^`]*)`\}|\{([^}]*)\})/g;
  for (const match of text.matchAll(regex)) {
    const raw = match[1] ?? match[2] ?? match[3] ?? "";
    for (const token of raw.split(/[^A-Za-z0-9_-]+/)) {
      if (token && !/^\d/.test(token)) classes.add(token);
    }
  }
}
console.log([...classes].sort().join("\n"));
