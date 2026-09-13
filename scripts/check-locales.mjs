import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1");
const dictionaries = Object.fromEntries(
  ["en", "bn"].map((locale) => [
    locale,
    JSON.parse(readFileSync(join(root, "locales", `${locale}.json`), "utf8")),
  ]),
);

function flatten(value, prefix = "", output = new Map()) {
  for (const [key, entry] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (entry && typeof entry === "object" && !Array.isArray(entry)) flatten(entry, path, output);
    else output.set(path, entry);
  }
  return output;
}

function sourceFiles(directory, output = []) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) sourceFiles(path, output);
    else if (/\.tsx?$/.test(name)) output.push(path);
  }
  return output;
}

const flattened = Object.fromEntries(Object.entries(dictionaries).map(([locale, value]) => [locale, flatten(value)]));
const errors = [];

for (const key of new Set([...flattened.en.keys(), ...flattened.bn.keys()])) {
  for (const locale of ["en", "bn"]) {
    if (!flattened[locale].has(key)) errors.push(`${locale}: missing ${key}`);
    else if (typeof flattened[locale].get(key) !== "string" || !flattened[locale].get(key).trim()) {
      errors.push(`${locale}: empty or non-string ${key}`);
    }
  }
}

const keyPattern = /\bt\(\s*["']([^"']+)["']/g;
for (const directory of ["app", "components", "lib"]) {
  for (const file of sourceFiles(join(root, directory))) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(keyPattern)) {
      if (!flattened.en.has(match[1])) errors.push(`${relative(root, file)}: unknown key ${match[1]}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Locale audit passed: ${flattened.en.size} matched English/Bangla keys.`);
