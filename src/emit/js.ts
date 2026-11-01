// React, Vue 3, Svelte 5, Solid: one component printer, target-specific syntax.
import type { E, N, Widget, Attrs } from "../dsl";

export type Js = "react" | "vue" | "svelte" | "solid";
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

export function jsExpr(e: E, ref: (k: "prop" | "lab", n: string) => string, q = '"'): string {
  const s = (v: string) => (q === "'" ? `'${v.replace(/'/g, "\\'")}'` : JSON.stringify(v));
  const r = (x: E): string => {
    switch (x.k) {
      case "prop": return ref("prop", x.n);
      case "lab": return ref("lab", x.n);
      case "item": return `pr.${x.n}`;
      case "lit": return s(x.v);
      case "eq": return `${r(x.a)} === ${s(x.v)}`;
      case "iff": return `${r(x.c)} ? ${r(x.a)} : ${r(x.b)}`;
      case "cat": return "`" + x.parts.map((p) => (p.k === "lit" ? p.v : p.k === "lab" ? `\${${r(p)} ?? ${s("")}}` : `\${${r(p)}}`)).join("") + "`";
    }
  };
  return r(e);
}

export function emitJs(t: Js, w: Widget): string {
  const defs = new Map(w.props.filter((p) => p.def !== undefined).map((p) => [p.name, p.def!]));
  const pre = t === "vue" || t === "solid" ? "p." : "";
  const ref = (k: "prop" | "lab", n: string) => (k === "lab" ? `${pre}labels.${n}` : `${pre}${n}`);
  const q = t === "vue" ? "'" : '"';
  const x = (e: E) => jsExpr(e, ref, q);
  const cls = t === "react" ? "className" : "class";
  const used = new Set<string>();
  const skins = new Set<string>();
  // attribute: name + expression (or literal)
  const at = (name: string, e: E | string): string => {
    if (typeof e === "string") return `${name}=${JSON.stringify(e)}`;
    if (e.k === "lit") return `${name}=${JSON.stringify(e.v)}`;
    return t === "vue" ? `:${kebab(name)}="${x(e)}"` : `${name}={${x(e)}}`;
  };
  const code = (name: string, js: string) => (t === "vue" ? `:${kebab(name)}="${js.replace(/"/g, "'")}"` : `${name}={${js}}`);
  const attrs = (a: Attrs) => Object.entries(a).map(([k, v]) => at(k, v));
  const out = (e: E) => (t === "vue" ? `{{ ${x(e)} }}` : `{${x(e)}}`);
  const idOf = (name: string) => code("id", `\`\${${ref("prop", "id")}}-${name}\``);
  const kids = (ns: N[], ind: string): string[] => ns.flatMap((n) => node(n, ind));
  const inline = (ns: N[]) => kids(ns, "").map((s) => s.trim()).join("");
  const node = (n: N, ind: string, extra: string[] = []): string[] => {
    const I = (s: string) => ind + s;
    switch (n.k) {
      case "head": used.add("WidgetHead");
        return [I(t === "svelte" ? "<WidgetHead {id} {title} {text} />" : `<WidgetHead ${[code("id", ref("prop", "id")), code("title", ref("prop", "title")), code("text", ref("prop", "text"))].join(" ")} />`)];
      case "messages": used.add("Messages");
        return [I(t === "svelte" ? `<Messages {id} {error}${n.info ? " {info}" : ""} />` : `<Messages ${[code("id", ref("prop", "id")), code("error", ref("prop", "error")), ...(n.info ? [at("info", n.info)] : [])].join(" ")} />`)];
      case "when": {
        const c = x(n.c);
        if (t === "react") {
          const body = kids(n.kids, ind + "  ");
          return n.kids.length === 1 ? [I(`{${c} ? (`), ...body, I(") : null}")] : [I(`{${c} ? (`), I("  <>"), ...kids(n.kids, ind + "    "), I("  </>"), I(") : null}")];
        }
        if (t === "solid") return n.kids.length === 1 && isLeaf(n.kids[0]) ? [I(`<Show when={${c}}>${inline(n.kids)}</Show>`)] : [I(`<Show when={${c}}>`), ...kids(n.kids, ind + "  "), I("</Show>")];
        if (t === "svelte") return n.kids.length === 1 && isLeaf(n.kids[0]) ? [I(`{#if ${c}}${inline(n.kids)}{/if}`)] : [I(`{#if ${c}}`), ...kids(n.kids, ind + "  "), I("{/if}")];
        // vue: v-if on a single element, <template v-if> otherwise
        if (n.kids.length === 1) return node(n.kids[0], ind, [`v-if="${c.replace(/"/g, "'")}"`]);
        return [I(`<template v-if="${c.replace(/"/g, "'")}">`), ...kids(n.kids, ind + "  "), I("</template>")];
      }
      case "each": {
        const list = `${ref("prop", n.list)} ?? []`;
        const k = n.kids[0];
        if (t === "react") return [I(`{(${list}).map((pr) => (`), ...node(k, ind + "  ", ["key={pr.id}"]), I("))}")];
        if (t === "solid") return [I(`<For each={${list}}>{(pr) => (`), ...node(k, ind + "  "), I(")}</For>")];
        if (t === "svelte") return [I(`{#each ${list} as pr (pr.id)}`), ...node(k, ind + "  "), I("{/each}")];
        return node(k, ind, [`v-for="pr in ${list}"`, `:key="pr.id"`]);
      }
      case "stack": used.add("Stack");
        return [I(`<Stack ${[...extra, `gap="${n.gap}"`, ...attrs(n.attrs)].join(" ")}>`), ...kids(n.kids, ind + "  "), I("</Stack>")];
      case "form": used.add("Form");
        return [I(`<Form ${[...extra, 'method="post"', code("action", ref("prop", "action")),
          code("errorId", t === "react" || t === "solid" ? `errorIdOf(${ref("prop", "id")}, ${ref("prop", "error")})` : `${ref("prop", "error")} ? \`\${${ref("prop", "id")}}-error\` : undefined`),
          'data-testid="authfly-form"'].join(" ")}>`), ...kids(n.kids, ind + "  "), I("</Form>")];
      case "hidden":
        if (t === "react" || t === "solid") { used.add("Hidden"); return [I(`<Hidden name="${n.name}" ${at("value", n.value)} />`)]; }
        used.add("Input"); return [I(`<Input type="hidden" name="${n.name}" ${at("value", n.value)} />`)];
      case "field": {
        used.add("Field"); used.add("Input"); skins.add("inputSkin");
        const ac = t === "react" ? "autoComplete" : "autocomplete";
        const inp = [at("type", n.type), `name="${n.name}"`, at(ac, n.autocomplete), ...(n.required ? ["required"] : []), idOf(n.name), code(cls, "inputSkin()"), 'data-testid="field"'];
        const fl = [code("label", x(n.label)).replace(/^:label="(.*)"$/, ':label="$1"'), code("htmlFor", `\`\${${ref("prop", "id")}}-${n.name}\``)];
        if (t === "react") return [I(`<Field ${[...extra, ...fl].join(" ")}>`), I(`  <Input ${inp.join(" ")} />`), I("</Field>")];
        const aria = [code("aria-describedby", "f.describe()"), code("aria-invalid", "f.invalid")];
        const el = `<Input ${[...inp, ...aria].join(" ")} />`;
        if (t === "vue") return [I(`<Field ${[...extra, ...fl, 'v-slot="f"'].join(" ")}>`), I(`  ${el}`), I("</Field>")];
        if (t === "svelte") return [I(`<Field ${[...extra, ...fl].join(" ")}>`), I(`  {#snippet children(f)}${el}{/snippet}`), I("</Field>")];
        return [I(`<Field ${[...extra, ...fl].join(" ")}>{(f) => (`), I(`  ${el}`), I(")}</Field>")];
      }
      case "button": {
        used.add("Button"); skins.add("buttonSkin");
        const a = [...extra, ...(n.href ? [at("href", n.href)] : []), code(cls, `buttonSkin(${q}${n.variant}${q}, ${q}${n.extra}${q})`), ...attrs(n.attrs), ...(n.testid ? [`data-testid="${n.testid}"`] : [])];
        const inner = n.kids.length === 1 && n.kids[0].k === "text" ? out(n.kids[0].v) : null;
        if (inner) return [I(`<Button ${a.join(" ")}>${inner}</Button>`)];
        if (t === "react") return [I(`<Button ${a.join(" ")}>`), ...kids(n.kids, ind + "  "), I("</Button>")];
        return [I(`<Button ${a.join(" ")}>${inline(n.kids)}</Button>`)];
      }
      case "submit": used.add("Button"); skins.add("buttonSkin");
        return [I(`<Button ${[...extra, 'type="submit"', code(cls, `buttonSkin(${q}default${q}, ${q}w-full${q})`), `data-testid="${n.testid}"`].join(" ")}>${out(n.label)}</Button>`)];
      case "link": used.add("Link"); skins.add("linkSkin");
        return [I(`<Link ${[...extra, at("href", n.href), code(cls, n.extra ? `linkSkin(${q}${n.extra}${q})` : "linkSkin()"), `data-testid="${n.testid}"`].join(" ")}>${out(n.label)}</Link>`)];
      case "foot": {
        used.add("Text"); used.add("Link"); skins.add("textSkin"); skins.add("linkSkin");
        const ln = `<Link ${[at("href", n.href), code(cls, "linkSkin()"), `data-testid="${n.testid}"`].join(" ")}>${out(n.label)}</Link>`;
        const sp = t === "react" || t === "solid" ? '{" "}' : " ";
        if (t === "react") return [I(`<Text ${[...extra, code(cls, "textSkin.muted")].join(" ")}>`), I(`  ${out(n.lead)}${sp}`), I(`  ${ln}`), I("</Text>")];
        return [I(`<Text ${[...extra, code(cls, "textSkin.muted")].join(" ")}>${out(n.lead)}${sp}${ln}</Text>`)];
      }
      case "icon": used.add("LucideIcon"); return [I(`<LucideIcon ${at("name", n.name)} />`)];
      case "text": return [I(out(n.v))];
    }
  };
  const isLeaf = (n: N) => ["button", "link", "submit", "foot", "text", "icon", "hidden"].includes(n.k);

  used.add("Card"); skins.add("widgetCardSkin");
  const lmProps = t === "react" || t === "solid" ? `{...landmark(${ref("prop", "id")}, ${ref("prop", "landmarkLabel")})}` : t === "vue" ? 'v-bind="lm"' : "{...lm}";
  const body = [`<Card ${code(cls, "widgetCardSkin()")} data-testid="authfly-${w.name}" ${lmProps}>`, ...kids(w.body, "  "), "</Card>"];
  const skinList = ["buttonSkin", "linkSkin", "inputSkin", "textSkin", "widgetCardSkin"].filter((s) => skins.has(s)).join(", ");
  const head = w.doc.split("\n").map((l) => `// ${l}`);
  const gen = `// Code generated by authfly/codegen from specs/widgets/${w.name}.def.ts. DO NOT EDIT.`;

  if (t === "react" || t === "solid") {
    const sol = t === "solid";
    const ui = (n: string, f: string) => `import { ${n} } from "../ui/${f}/${f}${sol ? ".solid" : ""}";`;
    const imp = [
      ...(sol ? [`import { ${["For", "Show"].filter((s) => body.join("\n").includes(`<${s}`)).concat("mergeProps").join(", ")} } from "solid-js";`] : []),
      `import { Card } from "../components/card";`,
      `import { ${["Stack", "Form"].filter((s) => used.has(s)).join(", ")} } from "../components/layout";`,
      ...(used.has("Field") ? [`import { Field } from "../components/field";`] : []),
      ...(used.has("LucideIcon") ? [`import { LucideIcon } from "../components/lucide-icon";`] : []),
      ...(used.has("Text") ? [ui("Text", "text")] : []), ...(used.has("Button") ? [ui("Button", "button")] : []),
      ...(used.has("Link") ? [ui("Link", "link")] : []), ...(used.has("Input") ? [ui("Input", "input")] : []),
      `import { ${skinList} } from "../skin/skin";`,
      `import { ${["WidgetHead", "Messages", "Hidden"].filter((s) => used.has(s)).concat("landmark", "errorIdOf").join(", ")} } from "./_parts";`,
    ];
    if (sol) {
      const d = w.props.filter((p) => p.def !== undefined).map((p) => `${p.name}: ${JSON.stringify(p.def)}${p.ts.startsWith('"') ? " as const" : ""}`).join(", ");
      return [gen, ...head, ...imp, `import type { ${w.component}Props } from "./props";`, `export type { ${w.component}Props };`, "",
        `export function ${w.component}(props: ${w.component}Props) {`, `  const p = mergeProps({ ${d} }, props);`, "  return (", ...body.map((l) => "    " + l), "  );", "}", ""].join("\n");
    }
    const types = [`import type { ${w.labelsType} } from "./authfly-${w.name}.types";`, `import type { Feature } from "./feature-grid.types";`];
    const pt = w.props.map((p) => `  ${p.name}${p.def !== undefined || p.optional ? "?" : ""}: ${p.ts};`);
    const args = w.props.map((p) => (p.def !== undefined ? `${p.name} = ${JSON.stringify(p.def)}` : p.name)).join(", ");
    return [gen, ...head, ...imp, ...types, "", `export type ${w.component}Props = {`, ...pt, "};", "",
      `export function ${w.component}({ ${args} }: ${w.component}Props) {`, "  return (", ...body.map((l) => "    " + l), "  );", "}", ""].join("\n");
  }
  const ext = t === "vue" ? "vue" : "svelte";
  const P = (s: string) => s[0].toUpperCase() + s.slice(1);
  const imp = [
    `import Card from "../components/Card.${ext}";`,
    ...["Stack", "Form", "Field", "LucideIcon"].filter((s) => used.has(s)).map((s) => `import ${s} from "../components/${s}.${ext}";`),
    ...["text", "button", "link", "input"].filter((s) => used.has(P(s))).map((s) => `import ${P(s)} from "../ui/${s}/${P(s)}.${ext}";`),
    ...["WidgetHead", "Messages"].filter((s) => used.has(s)).map((s) => `import ${s} from "./${s}.${ext}";`),
    `import { ${skinList} } from "../skin/skin";`,
    `import type { ${w.component}Props } from "./props";`,
  ];
  if (t === "vue") {
    const d = w.props.filter((p) => p.def !== undefined).map((p) => `${p.name}: ${JSON.stringify(p.def)}`).join(", ");
    return ['<script setup lang="ts">', gen, ...head, ...imp,
      `const p = withDefaults(defineProps<${w.component}Props>(), { ${d} });`,
      'const lm = { "aria-labelledby": p.landmarkLabel ? undefined : `${p.id}-title`, "aria-label": p.landmarkLabel };',
      "</script>", "<template>", ...body.map((l) => "  " + l), "</template>", ""].join("\n");
  }
  const args = w.props.map((p) => (p.def !== undefined ? `${p.name} = ${JSON.stringify(p.def)}` : p.name)).join(", ");
  return ['<script lang="ts">', ...[gen, ...head, ...imp].map((l) => "  " + l),
    `  let { ${args} }: ${w.component}Props = $props();`,
    '  const lm = $derived({ "aria-labelledby": landmarkLabel ? undefined : `${id}-title`, "aria-label": landmarkLabel });',
    "</script>", "", ...body, ""].join("\n");
}
