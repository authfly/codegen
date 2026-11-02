// Twig, Jinja2, Latte: templates over the Authfly macros (authfly/components.*); containers are built as captures.
import type { E, N, Widget, Attrs } from "../dsl";

export type Srv = "twig" | "jinja2" | "latte";

export function emitServer(t: Srv, w: Widget): string {
  const defs = new Map(w.props.filter((p) => p.def !== undefined).map((p) => [p.name, p.def!]));
  const L = t === "latte";
  const s = (v: string) => `'${v.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
  const or = t === "jinja2" ? "or" : "??";
  const none = t === "jinja2" ? "none" : "null";
  const get = (o: string, n: string) => (L ? `$${o}['${n}']` : `${o}.${n}`);
  const x = (e: E): string => {
    switch (e.k) {
      case "prop": return n2(e.n);
      case "lab": return `${get("l", e.n)} ${or} ''`;
      case "item": return `${get("pr", e.n)} ${or} ''`;
      case "lit": return s(e.v);
      case "eq": return `(${x(e.a)}) ${L ? "===" : "=="} ${s(e.v)}`;
      case "iff": return t === "jinja2" ? `${x(e.a)} if ${c(e.c)} else ${x(e.b)}` : `${c(e.c)} ? ${x(e.a)} : ${x(e.b)}`;
      case "or": return e.a.k === "lab" || e.a.k === "item" ? x(e.a) : `(${x(e.a)}) ${or} ${s(e.v)}`;
      case "let": return L ? `$${e.n}` : e.n;
      case "cat": return e.parts.map((p) => (p.k === "lit" ? s(p.v) : `(${x(p)})`)).join(L ? " . " : " ~ ");
    }
  };
  // id and error are bound once (see preamble)
  const n2 = (n: string) => (n === "id" ? (L ? "$id" : "id") : n === "error" ? (L ? "$error" : "error") : `${get("p", n)} ${or} ${s(defs.get(n) ?? "")}`);
  const c = (e: E) => (e.k === "eq" ? x(e) : x(e)); // truthiness: '' is false in all three
  const dict = (o: [string, string][]) => (L ? `[${o.map(([k, v]) => `${s(k)} => ${v}`).join(", ")}]` : `{${o.map(([k, v]) => `${s(k)}: ${v}`).join(", ")}}`);
  const ax = (a: Attrs): [string, string][] => Object.entries(a).map(([k, v]) => [k, v.k === "lit" ? s(v.v) : `${x(v).replace(/ (\?\?|or) ''$/, "")} ${or} ${none}`]);
  const call = (m: string, args: string[]) => (L ? `{include ${m}, ${args.join(", ")}}` : `{{ af.${m}(${args.join(", ")}) }}`);
  const skin = (...a: string[]) => `${L ? "afSkin" : "af_skin"}(${a.map(s).join(", ")})`;
  const esc = (v: string) => `${L ? "afEsc" : "af_esc"}(${v})`;
  const outp = (v: string) => (L ? `{${v}}` : `{{ ${v} }}`);
  let cap = 0;
  const capture = (body: string): [string, string] => {
    const v = `c${++cap}`;
    return L ? [`{capture $${v}}${body}{/capture}`, `$${v}`] : [`{%- set ${v} -%}${body}{%- endset -%}`, v];
  };
  const kids = (ns: N[]) => ns.map(node).join("\n");
  const node = (n: N): string => {
    switch (n.k) {
      case "head": {
        const a = [L ? "$id" : "id", n2("title"), n2("text")];
        if (!n.align && !n.role && !n.kids.length) return call("head", a);
        const hd = [...a, s(n.align ?? "start"), n.role ? x(n.role) : none];
        if (!n.kids.length) return call("head", hd);
        const [d, v] = capture(kids(n.kids));
        return `${d}\n${call("head", [...hd, v])}`;
      }
      case "messages": return call("messages", [L ? "$id" : "id", L ? "$error" : "error", n.info ? x(n.info) : "''"]);
      case "when": {
        const el = n.els ? (L ? `\n{else}\n${kids(n.els)}` : `\n{%- else -%}\n${kids(n.els)}`) : "";
        return L ? `{if ${c(n.c)}}\n${kids(n.kids)}${el}\n{/if}` : `{%- if ${c(n.c)} -%}\n${kids(n.kids)}${el}\n{%- endif -%}`;
      }
      case "each": {
        const list = `${get("p", n.list)} ${or} []`;
        return L ? `{foreach ${list} as $pr}${kids(n.kids)}{/foreach}` : `{%- for pr in ${list} -%}\n${kids(n.kids)}\n{%- endfor -%}`;
      }
      case "stack": { const [d, v] = capture(kids(n.kids)); return `${d}${call("stack", [s(n.gap), "''", "''", "''", dict(ax(n.attrs)), v])}`; }
      case "form": { const [d, v] = capture(kids(n.kids)); return `${d}\n${call("form", [n2(n.action), s(n.extra), dict([["data-testid", s("authfly-form")]]), v])}`; }
      case "hidden": return call("hidden", [s(n.name), x(n.value)]);
      case "field": {
        const input = dict([["type", x(n.type)], ["name", s(n.name)], ...(n.required ? [["required", "true"]] as [string, string][] : []), ["attrs", dict([...(n.inputmode ? [["inputmode", s(n.inputmode)]] as [string, string][] : []), ["autocomplete", x(n.autocomplete)]])]]);
        const fe = L ? "$formError" : "formError";
        const idx = (suf: string) => `${L ? "$id . " : "id ~ "}${s("-" + suf)}`;
        const f: [string, string][] = [["label", x(n.label)], ["for", idx(n.name)], ...(n.hint ? [["hint", x(n.hint)]] as [string, string][] : []), ["formError", fe]];
        if (!n.addon) return call("field", [dict([...f, ["input", input]])]);
        // addon: muted text after the input (field macro: describe + suffix), only when non-blank
        const a = n.addon; const on = x(a.text);
        const tx = call("text", [s("span"), `${L ? "afText" : "af_text"}('muted')`, dict([["id", idx(a.id)], ["data-testid", s(a.testid)]]), esc(on)]);
        const [d, v] = capture(L ? `{if ${on}}${tx}{/if}` : `{%- if ${on} -%}${tx}{%- endif -%}`);
        const describe = t === "jinja2" ? `${idx(a.id)} if ${on} else none` : `(${on}) ? ${idx(a.id)} : null`;
        return `${d}\n${call("field", [dict([...f, ["describe", describe], ["suffix", L ? `(string) ${v}` : v], ["input", input]])])}`;
      }
      case "checkbox": {
        const fe = L ? "$formError" : "formError";
        const cid = `${L ? "$id . " : "id ~ "}${s("-" + n.name)}`;
        const inv = t === "jinja2" ? `'true' if ${fe} else none` : `${fe} ? 'true' : null`;
        const body = t === "twig"
          ? `{{ include('ui/checkbox/Checkbox.html.twig', {name: ${s(n.name)}, ${n.required ? "required: true, " : ""}id: ${cid}, ariaDescribedBy: ${fe}, ariaInvalid: ${inv}, class: af_skin('checkbox')}, with_context = false) }}{{- include('ui/label/Label.html.twig', {htmlFor: ${cid}, class: af_skin('label', 'font-normal'), children: af_esc(${x(n.label)})}, with_context = false) }}`
          : t === "latte"
            ? `{include '../ui/checkbox/Checkbox.latte', name: ${s(n.name)}, ${n.required ? "required: true, " : ""}id: ${cid}, ariaDescribedBy: ${fe}, ariaInvalid: ${inv}, class: afSkin('checkbox')}{include '../ui/label/Label.latte', htmlFor: ${cid}, class: afSkin('label', 'font-normal'), children: (string) afEsc(${x(n.label)})}`
            : `{{ af.prim('ui/checkbox/checkbox.html.j2', {'Name': ${s(n.name)}, ${n.required ? "'Required': true, " : ""}'ID': ${cid}, 'AriaDescribedBy': ${fe}, 'AriaInvalid': ${inv}, 'Class': af_skin('checkbox')}) }}{{- af.prim('ui/label/label.html.j2', {'For': ${cid}, 'Class': af_skin('label', 'font-normal')}, af_esc(${x(n.label)})) }}`;
        const [d, v] = capture(body);
        return `${d}\n${call("group", [s("2"), "''", "''", s(n.extra), L ? "[]" : "{}", v])}`;
      }
      case "button": {
        const a = dict([...ax(n.attrs), ...(n.testid ? [["data-testid", s(n.testid)]] as [string, string][] : [])]);
        const head = [n.href ? x(n.href) : "''", "''", skin("button", n.variant, n.extra), a];
        if (n.kids.length === 1 && n.kids[0].k === "text") return call("button", [...head, esc(x(n.kids[0].v))]);
        const [d, v] = capture(n.kids.map(node).join(""));
        return `${d}\n${call("button", [...head, v])}`;
      }
      case "submit": return call("button", ["''", s("submit"), skin("button", "default", "w-full"), dict([["data-testid", s(n.testid)]]), esc(x(n.label))]);
      case "link": return call("link", [x(n.href), n.extra ? skin("link", n.extra) : skin("link"), s(n.testid), x(n.label)]);
      case "foot": {
        const [d, v] = capture(`${outp(x(n.lead))} ${call("link", [x(n.href), skin("link"), s(n.testid), x(n.label)])}`);
        return `${d}\n${call("text", ["''", `${L ? "afText" : "af_text"}('muted')`, L ? "[]" : "{}", v])}`;
      }
      case "icon": return call("icon", [x(n.name)]);
      case "iconBadge": return call(L ? "iconBadge" : "icon_badge", [x(n.icon), x(n.tone)]);
      case "para": return call("text", ["''", s(n.cls), dict([["data-testid", s(n.testid)]]), esc(x(n.v))]);
      case "text": return outp(x(n.v));
    }
  };
  const gen = `Code generated by authfly/codegen from specs/widgets/${w.name}.def.ts. DO NOT EDIT.`;
  const doc = w.doc.replace(/\n/g, "\n   ");
  const body = kids(w.body);
  const [bd, bv] = capture("\n" + body + "\n");
  const tid = `authfly-${w.name}`;
  const cardSkin = w.card?.extra ? skin("widgetCard", w.card.extra) : skin("widgetCard");
  const cardAttrs = Object.entries(w.card?.attrs ?? {}).map(([k, v]) => [k, x(v)] as [string, string]);
  const letLines = (w.lets ?? []).map((l) => (L ? `{var $${l.name} = ${x(l.e)}}` : `{%- set ${l.name} = ${x(l.e)} -%}`));
  if (L) {
    return [`{* ${gen}`, `   ${doc} *}`, "{import '../authfly/components.latte'}",
      "{var $id = $p['id'] ?? ''}{var $l = $p['labels'] ?? []}{var $error = $p['error'] ?? ''}",
      "{var $formError = $error ? $id . '-error' : null}",
      "{var $lm = ['aria-labelledby' => ($p['landmarkLabel'] ?? '') ? null : $id . '-title', 'aria-label' => $p['landmarkLabel'] ?? null]}",
      ...letLines, bd, `{include card, ${cardSkin}, ${dict([["data-testid", s(tid)], ...cardAttrs])} + $lm, ${bv}}`, ""].join("\n");
  }
  const lm = t === "twig"
    ? `${dict([["data-testid", s(tid)], ...cardAttrs])}|merge({'aria-labelledby': (p.landmarkLabel ?? '') ? null : id ~ '-title', 'aria-label': p.landmarkLabel ?? null})`
    : `{'data-testid': '${tid}', ${cardAttrs.map(([k, v]) => `${s(k)}: ${v}, `).join("")}'aria-labelledby': none if p.landmarkLabel else id ~ '-title', 'aria-label': p.landmarkLabel or none}`;
  const ext = t === "twig" ? "html.twig" : "html.j2";
  return [`{#- ${gen}`, `    ${w.doc.replace(/\n/g, "\n    ")} -#}`, `{%- import 'authfly/components.${ext}' as af -%}`,
    `{%- set id = p.id ${or} '' -%}{%- set l = p.labels ${or} {} -%}{%- set error = p.error ${or} '' -%}`,
    t === "twig" ? "{%- set formError = error ? id ~ '-error' : null -%}" : "{%- set formError = id ~ '-error' if error else none -%}",
    ...letLines, bd, `{{ af.card(${cardSkin}, ${lm}, ${bv}) }}`, ""].join("\n");
}
