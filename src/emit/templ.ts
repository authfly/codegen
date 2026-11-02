// Go templ: a templ component over the Authfly templ components (components.templ) and helpers in blocks.templ.
import type { E, N, Widget, Attrs } from "../dsl";

const G = (n: string) => (n === "id" ? "ID" : n[0].toUpperCase() + n.slice(1));

const imports = (ms: string[]) => {
  const path = (m: string) => `"github.com/authfly/authkit/packages/ui/templ/ui/${m}"`;
  if (!ms.length) return [];
  return ms.length === 1 ? [`import ${path(ms[0])}`, ""] : ["import (", ...ms.map((m) => `\t${path(m)}`), ")", ""];
};

export function emitTempl(w: Widget): string {
  const defs = new Map(w.props.filter((p) => p.def !== undefined).map((p) => [p.name, p.def!]));
  const q = (v: string) => JSON.stringify(v);
  const pr = (n: string) => (n === "id" ? "id" : n === "error" ? "errs" : defs.get(n) ? `or(Str(p.${G(n)}), ${q(defs.get(n)!)})` : `Str(p.${G(n)})`);
  const x = (e: E): string => {
    switch (e.k) {
      case "prop": return pr(e.n);
      case "lab": return `Lab(labels, ${q(e.n)})`;
      case "item": return `pr.${G(e.n)}`;
      case "lit": return q(e.v);
      case "eq": return `${x(e.a)} == ${q(e.v)}`;
      case "iff": return `map[bool]string{true: ${x(e.a)}, false: ${x(e.b)}}[${x(e.c)}]`;
      case "cat": return e.parts.map(x).join(" + ");
      case "or": return x(e.a); // Lab / Str already default to ""
      case "let": return e.n;
    }
  };
  const lets = new Map((w.lets ?? []).map((l) => [l.name, l.e]));
  const isBool = (e: E): boolean => e.k === "eq" || (e.k === "let" && isBool(lets.get(e.n)!));
  const cond = (e: E) => (isBool(e) ? x(e) : `${x(e)} != ""`);
  const A = (a: [string, string][]) => `A(${a.map(([k, v]) => `${q(k)}, ${v}`).join(", ")})`;
  const ax = (a: Attrs): [string, string][] => Object.entries(a).map(([k, v]) => [k, x(v)]);
  const kids = (ns: N[], ind: string): string[] => ns.flatMap((n) => node(n, ind));
  const node = (n: N, ind: string): string[] => {
    const I = (s: string) => ind + s;
    switch (n.k) {
      case "head": {
        const h = `@WidgetHead(id, ${pr("title")}, ${pr("text")}, ${q(n.align ?? "")}, ${n.role ? x(n.role) : '""'})`;
        return n.kids.length ? [I(`${h} {`), ...kids(n.kids, ind + "\t"), I("}")] : [I(h)];
      }
      case "messages": return [I(`@Messages(id, errs, ${n.info ? x(n.info) : '""'})`)];
      case "when": return [I(`if ${cond(n.c)} {`), ...kids(n.kids, ind + "\t"), ...(n.els ? [I("} else {"), ...kids(n.els, ind + "\t")] : []), I("}")];
      case "each": return [I(`for _, pr := range Items(p.${G(n.list)}) {`), ...kids(n.kids, ind + "\t"), I("}")];
      case "stack": return [I(`@Stack(${q(n.gap)}, "", "", "", ${A(ax(n.attrs))}) {`), ...kids(n.kids, ind + "\t"), I("}")];
      case "form": return [I(`@Form(${pr(n.action)}, ${q(n.extra)}, A("data-testid", "authfly-form")) {`), ...kids(n.kids, ind + "\t"), I("}")];
      case "hidden": return [I(`@Hidden(${q(n.name)}, ${x(n.value)})`)];
      case "field": {
        const fp = `FieldProps{Label: ${x(n.label)}, HtmlFor: id + ${q("-" + n.name)}, ${n.hint ? `Hint: ${x(n.hint)}, ` : ""}FormError: formErr}`;
        const ctl = n.addon
          ? `addonInput(f, ${x(n.type)}, ${q(n.name)}, ${x(n.autocomplete)}, id+${q("-" + n.name)}, ${n.required}, id+${q("-" + n.addon.id)}, ${x(n.addon.text)}, ${q(n.addon.testid)})`
          : `TextInput(f, ${x(n.type)}, ${q(n.name)}, ${x(n.autocomplete)}, id+${q("-" + n.name)}, ${n.required}, ""${n.inputmode ? `, "inputmode", ${q(n.inputmode)}` : ""})`;
        return [I(`@Field(${fp}, field(func(f FieldControl) templ.Component {`), I(`\treturn ${ctl}`), I("}))")];
      }
      case "checkbox": return [
        I(`@Group("2", "", "", ${q(n.extra)}, nil) {`),
        I(`\t@checkbox.Checkbox(checkbox.CheckboxProps{Name: ${q(n.name)}, ${n.required ? "Required: true, " : ""}ID: id + ${q("-" + n.name)}, AriaDescribedBy: formErr, AriaInvalid: invalidIf(formErr), Class: CheckboxSkin()})`),
        I(`\t@label.Label(label.LabelProps{For: id + ${q("-" + n.name)}, Class: LabelSkin("font-normal")}) {`),
        I(`\t\t{ ${x(n.label)} }`),
        I("\t}"),
        I("}"),
      ];
      case "button": {
        const cls = `ButtonSkin(${q(n.variant)}, ${q(n.extra)})`;
        if (n.href && n.testid && n.kids.length === 1 && n.kids[0].k === "text" && !Object.keys(n.attrs).length)
          return [I(`@buttonLink(${x(n.href)}, ${cls}, ${q(n.testid)}, ${x(n.kids[0].v)})`)];
        const at = [...ax(n.attrs), ...(n.testid ? [["data-testid", q(n.testid)]] as [string, string][] : [])];
        return [I(`@button.Button(button.ButtonProps{${n.href ? `Href: ${x(n.href)}, ` : ""}Class: ${cls}${at.length ? `, Attrs: ${A(at)}` : ""}}) {`), ...kids(n.kids, ind + "\t"), I("}")];
      }
      case "submit": return [I(`@submit(ButtonSkin("default", "w-full"), ${q(n.testid)}, ${x(n.label)})`)];
      case "link": return [I(`@authLink(${x(n.href)}, LinkSkin(${n.extra ? q(n.extra) : ""}), ${q(n.testid)}, ${x(n.label)})`)];
      case "foot": return [I(`@footLine(${x(n.lead)}, ${x(n.href)}, ${q(n.testid)}, ${x(n.label)})`)];
      case "icon": return [I(`@LucideIcon(${x(n.name)}, "")`)];
      case "iconBadge": return [I(`@IconBadge(${x(n.icon)}, ${x(n.tone)})`)];
      case "para": return [I(`@text.Text(text.TextProps{Class: ${q(n.cls)}, Attrs: A("data-testid", ${q(n.testid)})}) {`), I(`\t{ ${x(n.v)} }`), I("}")];
      case "text": return [I(`{ ${x(n.v)} }`)];
    }
  };
  const body = kids(w.body, "\t\t");
  const src = body.join("\n");
  return [
    `// Code generated by authfly/codegen from specs/widgets/${w.name}.def.ts. DO NOT EDIT.`,
    ...w.doc.split("\n").map((l) => `// ${l}`),
    "package authfly", "",
    ...imports(["button", "checkbox", "label", "text"].filter((m) => src.includes(`@${m}.`))),
    `templ ${w.component}(p ${w.component}Props) {`,
    ...(w.props.some((p) => p.name === "error")
      ? ["\t{{ id, labels, errs := Str(p.Id), p.Labels, Str(p.Error) }}", "\t{{ formErr := errorID(id, errs) }}"]
      : ["\t{{ id, labels := Str(p.Id), p.Labels }}"]),
    ...(w.lets ?? []).map((l) => `\t{{ ${l.name} := ${x(l.e)} }}`),
    `\t@Card(WidgetCardSkin(${w.card?.extra ? q(w.card.extra) : ""}), landmark(id, Str(p.LandmarkLabel), "data-testid", "authfly-${w.name}"${ax(w.card?.attrs ?? {}).map(([k, v]) => `, ${q(k)}, ${v}`).join("")})) {`,
    ...body,
    "\t}",
    "}",
    "",
  ].join("\n");
}
