#!/usr/bin/env bun
// authfly-codegen: the Authfly code generators, run against an authkit checkout.
//   bun src/cli.ts <shared|registry|widgets|all> [--check] --root <authkit>
//   shared    packages/shared/src -> skin/types/icons/theme in the 9 targets (copies for JS, tables for Go/PHP/Python)
//   registry  packages/ui/<rt> -> packages/registry/src/<rt>/registry.json (primitives as pinned @ui8kit/registry URLs)
//   widgets   specs/widgets/*.def.ts -> the widget source in the 9 targets
// --check writes nothing and exits 1 when a generated file is missing or differs (CI).
import { resolve } from "path";
import { existsSync } from "fs";
import { shared } from "./shared";
import { registry } from "./registry";
import { widgets } from "./widgets";

const args = process.argv.slice(2);
const cmd = args[0];
const check = args.includes("--check");
const i = args.indexOf("--root");
const root = resolve(i >= 0 ? args[i + 1] : ".");
if (!["shared", "registry", "widgets", "all"].includes(cmd ?? "")) {
  console.error("usage: authfly-codegen <shared|registry|widgets|all> [--check] --root <authkit>"); process.exit(2);
}
if (!existsSync(`${root}/packages/shared/src`)) { console.error(`authfly-codegen: ${root} is not an authkit checkout`); process.exit(2); }
let bad = 0;
// widgets first: registry hashes nothing but lists files, shared is independent
if (cmd === "widgets" || cmd === "all") bad += await widgets(root, check);
if (cmd === "shared" || cmd === "all") bad += await shared(root, check);
if (cmd === "registry" || cmd === "all") bad += registry(root, check);
process.exit(bad ? 1 : 0);
