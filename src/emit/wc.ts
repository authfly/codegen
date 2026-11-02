// Web Components: a render function over the light-DOM primitives (packages/ui/webcomponent/src/blocks/_parts.ts helpers).
import type { E, N, Widget, Attrs } from "../dsl";
import { jsExpr } from "./js";

export function emitWc(w: Widget): string {
  const defs = new Map(w.props.filter((p) => p.def !== undefined).map((p) => [p.name, p.def!]));
  const lets = new Map((w.lets ?? []).map((l) => [l.name, l.e]));
  const ref = (k: "prop" | "lab" | "let", n: string): string =>
    k === "let" ? jsExpr(lets.get(n)!, ref) : k === "lab" ? `p.labels.${n}` : defs.has(n) ? `(p.${n} ?? ${JSON.stringify(defs.get(n))})` : `p.${n}`;
  const x = (e: E) => jsExpr(e, ref);
  const used = new Set<string>(); const skins = new Set<string>(["widgetCardSkin"]);
  const obj = (o: [string, string][]) => `{ ${o.map(([k, v]) => `${/^[a-zA-Z]+$/.test(k) ? k : JSON.stringify(k)}: ${v}`).join(", ")} }`;
  const ax = (a: Attrs): [string, string][] => Object.entries(a).map(([k, v]) => [k, x(v)]);
  const list = (ns: N[]) => `[${ns.map(node).join(", ")}]`;
  const node = (n: N): string => {
    switch (n.k) {
      case "head": used.add("head");
        if (!n.align && !n.role && !n.kids.length) return `head(p.id, p.title, p.text)`;
        return `head(p.id, p.title, p.text, ${JSON.stringify(n.align ?? "start")}, ${n.role ? x(n.role) : "undefined"}${n.kids.length ? `, ${list(n.kids)}` : ""})`;
      case "messages": used.add("messages"); return `...messages(p.id, ${ref("prop", "error")}${n.info ? `, ${x(n.info)}` : ""})`;
      case "when":
        if (n.els) return n.kids.length === 1 && n.els.length === 1 ? `${x(n.c)} ? ${node(n.kids[0])} : ${node(n.els[0])}` : `...(${x(n.c)} ? ${list(n.kids)} : ${list(n.els)})`;
        return n.kids.length === 1 ? `${x(n.c)} ? ${node(n.kids[0])} : null` : `...(${x(n.c)} ? ${list(n.kids)} : [])`;
      case "each": return `...(${ref("prop", n.list)} ?? []).map((${n.as ?? "pr"}) => ${node(n.kids[0])})`;
      case "group": used.add("group"); return `group(${obj([["gap", JSON.stringify(n.gap)], ...(n.justify ? [["justify", JSON.stringify(n.justify)]] as [string, string][] : [])])}, ${list(n.kids)})`;
      case "el": {
        const f = n.prim === "Box" ? "box" : "text"; used.add(f); if (n.muted) skins.add("textSkin");
        const o: [string, string][] = [...(n.tag ? [["tag", JSON.stringify(n.tag)]] as [string, string][] : []), ...ax(n.attrs),
          ...(n.muted ? [["class", "textSkin.muted"]] as [string, string][] : n.cls ? [["class", JSON.stringify(n.cls)]] as [string, string][] : [])];
        return `${f}(${obj(o)}, ${list(n.kids)})`;
      }
      case "title": used.add("title"); return `title(${n.level}, { id: \`\${p.id}-${n.idSuffix}\` }, [${x(n.label)}])`;
      case "badge": used.add("badge"); return `badge(${x(n.variant)}, ${n.testid ? `{ "data-testid": ${JSON.stringify(n.testid)} }` : "{}"}, [${x(n.label)}])`;
      case "separator": used.add("separator"); return `separator({ decorative: true, class: ${JSON.stringify(n.cls)} })`;
      case "sp": return `" "`;
      case "stack": used.add("stack"); return `stack(${obj([["gap", JSON.stringify(n.gap)], ...ax(n.attrs)])}, ${list(n.kids)})`;
      case "form": used.add("form"); return `form(${obj([["action", ref("prop", n.action)], ...(n.extra ? [["class", JSON.stringify(n.extra)]] as [string, string][] : []), ["data-testid", JSON.stringify(n.testid)]])}, ${list(n.kids)})`;
      case "iconBadge": used.add("iconBadge"); return `iconBadge(${x(n.icon)}, ${x(n.tone)})`;
      case "para": used.add("text"); return `text(${obj([["class", JSON.stringify(n.cls)], ["data-testid", JSON.stringify(n.testid)]])}, [${x(n.v)}])`;
      case "hidden": used.add("hidden"); return `hidden(${JSON.stringify(n.name)}, ${x(n.value)})`;
      case "field": {
        used.add("field"); used.add("errOf");
        const fp = obj([["label", x(n.label)], ["htmlFor", `\`\${p.id}-${n.name}\``], ...(n.hint ? [["hint", x(n.hint)]] as [string, string][] : []), ["formError", `errOf(p.id, ${ref("prop", "error")})`]]);
        const ip: [string, string][] = [["type", x(n.type)], ["name", JSON.stringify(n.name)], ...(n.inputmode ? [["inputmode", JSON.stringify(n.inputmode)]] as [string, string][] : []), ["autocomplete", x(n.autocomplete)], ...(n.required ? [["required", "true"]] as [string, string][] : []), ["id", `\`\${p.id}-${n.name}\``]];
        if (!n.addon) { used.add("ctl"); return `field(${fp}, ctl(${obj(ip)}))`; }
        const a = n.addon; const aid = `\`\${p.id}-${a.id}\``;
        used.add("input"); used.add("group"); used.add("text"); skins.add("inputSkin"); skins.add("textSkin");
        const inp = `input(${obj([...ip, ["class", "inputSkin()"], ["data-testid", '"field"'], ["aria-describedby", `f.describe(${x(a.text)} ? ${aid} : undefined)`], ["aria-invalid", "f.invalid"]])} as never)`;
        return `field(${fp}, (f) => group({ gap: "2" }, [${inp}, ${x(a.text)} ? text(${obj([["tag", '"span"'], ["id", aid], ["class", "textSkin.muted"], ["data-testid", JSON.stringify(a.testid)]])}, [${x(a.text)}]) : null]))`;
      }
      case "checkbox": {
        used.add("group"); used.add("checkbox"); used.add("label"); used.add("errOf"); skins.add("checkboxSkin"); skins.add("labelSkin");
        const cid = `\`\${p.id}-${n.name}\``; const fe = `errOf(p.id, ${ref("prop", "error")})`;
        return `group(${obj([["gap", '"2"'], ...(n.extra ? [["class", JSON.stringify(n.extra)]] as [string, string][] : [])])}, [checkbox(${obj([["name", JSON.stringify(n.name)], ...(n.required ? [["required", "true"]] as [string, string][] : []), ["id", cid], ["aria-describedby", fe], ["aria-invalid", `${fe} ? "true" : undefined`], ["class", "checkboxSkin()"]])}), label({ for: ${cid}, class: labelSkin("font-normal") }, [${x(n.label)}])])`;
      }
      case "button": used.add("button"); skins.add("buttonSkin");
        return `button(${obj([...(n.type ? [["type", JSON.stringify(n.type)]] as [string, string][] : []), ...(n.href ? [["href", x(n.href)]] as [string, string][] : []), ["class", `buttonSkin("${n.variant}", "${n.extra}")`], ...ax(n.attrs), ...(n.testid ? [["data-testid", JSON.stringify(n.testid)]] as [string, string][] : [])])}, ${list(n.kids)})`;
      case "submit": used.add("submit"); return `submit(${x(n.label)}, "default", ${JSON.stringify(n.testid)})`;
      case "link": used.add("link"); skins.add("linkSkin");
        return `link({ href: ${x(n.href)}, class: linkSkin(${n.extra ? JSON.stringify(n.extra) : ""}), "data-testid": ${JSON.stringify(n.testid)} }, [${x(n.label)}])`;
      case "foot": used.add("text"); used.add("link"); skins.add("textSkin"); skins.add("linkSkin");
        return `text({ class: textSkin.muted }, [${x(n.lead)} ?? "", " ", link({ href: ${x(n.href)}, class: linkSkin(), "data-testid": ${JSON.stringify(n.testid)} }, [${x(n.label)}])])`;
      case "icon": used.add("lucideIcon"); return `lucideIcon(${x(n.name)})`;
      case "text": return x(n.v);
    }
  };
  const body = `card({ class: widgetCardSkin(${w.card?.extra ? JSON.stringify(w.card.extra) : ""}), "data-testid": "authfly-${w.name}", ${ax(w.card?.attrs ?? {}).map(([k, v]) => `${JSON.stringify(k)}: ${v}, `).join("")}...lm(p.id, p.landmarkLabel) }, ${list(w.body)})`;
  const fn = `render${w.component}`;
  const prim = ["box", "text", "button", "link", "input", "label", "checkbox", "separator"].filter((s) => used.has(s));
  const comps = ["badge", "card", "field", "form", "group", "iconBadge", "lucideIcon", "stack", "title"].filter((s) => s === "card" || used.has(s));
  const parts = ["lm", "head", "messages", "hidden", "errOf", "ctl", "submit"].filter((s) => s === "lm" || used.has(s));
  return [
    `// Code generated by authfly/codegen from specs/widgets/${w.name}.def.ts. DO NOT EDIT.`,
    ...w.doc.split("\n").map((l) => `// ${l}`),
    ...prim.map((s) => `import { render${s[0].toUpperCase() + s.slice(1)} as ${s} } from "../ui/${s}/${s}.wc";`),
    `import { ${comps.join(", ")} } from "../components";`,
    `import { ${["buttonSkin", "checkboxSkin", "inputSkin", "labelSkin", "linkSkin", "textSkin", "widgetCardSkin"].filter((s) => skins.has(s)).join(", ")} } from "../skin/skin";`,
    `import { ${parts.join(", ")} } from "./_parts";`,
    `import type { ${w.component}Props } from "./props";`,
    "",
    `export function ${fn}(p: ${w.component}Props): Element {`,
    `  return ${body};`,
    "}",
    "",
  ].join("\n");
}
