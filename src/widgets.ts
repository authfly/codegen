// widgets: specs/widgets/*.def.ts -> the widget source of the 9 targets in an authkit checkout.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import type { Widget } from "./dsl";
import { emitJs } from "./emit/js";
import { emitWc } from "./emit/wc";
import { emitServer } from "./emit/server";
import { emitTempl } from "./emit/templ";

const specs = join(import.meta.dir, "../specs/widgets");
const pascal = (w: string) => w.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join("");

/** packages/ui-relative path -> content, for every widget spec. */
export async function widgetFiles(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const f of readdirSync(specs).filter((f) => f.endsWith(".def.ts")).sort()) {
    const w: Widget = (await import(join(specs, f))).default;
    const P = pascal(w.name);
    out.set(`react/src/blocks/authfly-${w.name}.tsx`, emitJs("react", w));
    out.set(`solid/src/blocks/authfly-${w.name}.tsx`, emitJs("solid", w));
    out.set(`vue/src/blocks/Authfly${P}.vue`, emitJs("vue", w));
    out.set(`svelte/src/blocks/Authfly${P}.svelte`, emitJs("svelte", w));
    out.set(`webcomponent/src/blocks/authfly-${w.name}.ts`, emitWc(w));
    out.set(`templ/authfly/authfly_${w.name.replace(/-/g, "_")}.templ`, emitTempl(w));
    out.set(`twig/blocks/authfly-${w.name}.html.twig`, emitServer("twig", w));
    out.set(`latte/blocks/authfly-${w.name}.latte`, emitServer("latte", w));
    out.set(`jinja2/blocks/authfly-${w.name}.html.j2`, emitServer("jinja2", w));
  }
  return out;
}

export async function widgets(root: string, check: boolean): Promise<number> {
  let bad = 0;
  const files = await widgetFiles();
  for (const [rel, body] of files) {
    const p = join(root, "packages/ui", rel);
    const cur = existsSync(p) ? readFileSync(p, "utf8") : null;
    if (cur === body) continue;
    if (check) { console.error(`widgets: packages/ui/${rel} ${cur === null ? "missing" : "differs from the spec"}`); bad++; }
    else { writeFileSync(p, body); console.log(`widgets: wrote packages/ui/${rel}`); }
  }
  if (check && !bad) console.log(`widgets: ${files.size} generated files up to date`);
  return bad;
}
