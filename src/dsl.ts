// Widget spec DSL: one typed tree per Authfly widget, printed into the 9 targets by src/emit/*.
// Same idea as ui8kit/codegen bricks (bricks/<name>/<name>.def.ts -> emitters), one level up: the nodes are the
// Authfly middle layer (Card, Field, Stack, ...) and UI8Kit primitives, not raw elements.

/** Expressions. prop = widget prop (default from the spec), lab = labels.<k>, item = current each() item field. */
export type E =
  | { k: "prop"; n: string }
  | { k: "lab"; n: string }
  | { k: "item"; n: string; v?: string }
  | { k: "lit"; v: string }
  | { k: "eq"; a: E; v: string }
  | { k: "iff"; c: E; a: E; b: E }
  | { k: "cat"; parts: E[] }
  | { k: "or"; a: E; v: string }
  | { k: "let"; n: string };
export const prop = (n: string): E => ({ k: "prop", n });
export const lab = (n: string): E => ({ k: "lab", n });
/** item(field, var): a field of the current each() item; var = the loop variable (each `as`, default pr). */
export const item = (n: string, v?: string): E => (v ? { k: "item", n, v } : { k: "item", n });
export const lit = (v: string): E => ({ k: "lit", v });
export const eq = (a: E, v: string): E => ({ k: "eq", a, v });
export const iff = (c: E, a: E | string, b: E | string): E => ({ k: "iff", c, a: ex(a), b: ex(b) });
export const cat = (...parts: (E | string)[]): E => ({ k: "cat", parts: parts.map(ex) });
/** a ?? v (an optional label in JS targets; templ/server lookups already default to ''). */
export const orv = (a: E, v: string): E => ({ k: "or", a, v });
/** A widget-level local (Widget.lets): a named local in React, templ and the server targets, inlined elsewhere. */
export const local = (n: string): E => ({ k: "let", n });
export const ex = (v: E | string): E => (typeof v === "string" ? lit(v) : v);

export type Attrs = Record<string, E>;
/** Nodes: the Authfly middle layer + the primitives a widget uses directly. */
export type N =
  | { k: "head"; align?: string; role?: E; kids: N[] }
  | { k: "messages"; info?: E }
  | { k: "when"; c: E; kids: N[]; els?: N[]; inline?: boolean }
  | { k: "each"; list: string; kids: N[]; as?: string }
  | { k: "stack"; gap: string; attrs: Attrs; kids: N[] }
  | { k: "group"; gap: string; justify?: string; kids: N[] }
  | { k: "el"; prim: "Box" | "Text"; tag?: string; cls: string; muted?: boolean; attrs: Attrs; kids: N[]; inline?: boolean }
  | { k: "title"; level: number; idSuffix: string; label: E }
  | { k: "badge"; variant: E; label: E; testid?: string }
  | { k: "separator"; cls: string }
  | { k: "sp" }
  | { k: "form"; kids: N[]; action: string; extra: string; errorId: boolean; testid: string }
  | { k: "hidden"; name: string; value: E }
  | { k: "field"; label: E; name: string; type: E; autocomplete: E; required: boolean; hint?: E; addon?: Addon; inputmode?: string }
  | { k: "checkbox"; name: string; label: E; required: boolean; extra: string }
  | { k: "button"; type?: "submit"; href?: E; variant: "default" | "outline"; extra: string; testid?: string; attrs: Attrs; kids: N[] }
  | { k: "submit"; testid: string; label: E }
  | { k: "link"; href: E; extra?: string; testid: string; label: E }
  | { k: "foot"; lead: E; href: E; testid: string; label: E }
  | { k: "icon"; name: E }
  | { k: "iconBadge"; icon: E; tone: E }
  | { k: "para"; v: E; cls: string; testid: string }
  | { k: "text"; v: E };
/** Addon: muted text after the input in a Group (e.g. the mail domain), id = <widget id>-<id>, linked to the input via
 *  aria-describedby only when the text is non-blank. */
export type Addon = { id: string; testid: string; text: E };
/** WidgetHead; align / role (live region on the head Stack) / kids (extra lines under the text) for notices. */
export const head = (h: { align?: string; role?: E; kids?: N[] } = {}): N => ({ k: "head", align: h.align, role: h.role, kids: h.kids ?? [] });
export const messages = (info?: E): N => ({ k: "messages", info });
/** when: els = the else branch; inline = React prints a single-kid branch on one line ({c ? <X /> : null}). */
export const when = (c: E, kids: N[], o: { els?: N[]; inline?: boolean } = {}): N => ({ k: "when", c, kids, els: o.els, inline: o.inline });
export const each = (list: string, kids: N[], as?: string): N => (as ? { k: "each", list, kids, as } : { k: "each", list, kids });
export const stack = (gap: string, attrs: Attrs, kids: N[]): N => ({ k: "stack", gap, attrs, kids });
/** form: action = the prop holding the URL (default action); errorId = link the form error (default true). */
export const form = (kids: N[], o: { action?: string; extra?: string; errorId?: boolean; testid?: string } = {}): N =>
  ({ k: "form", kids, action: o.action ?? "action", extra: o.extra ?? "", errorId: o.errorId ?? true, testid: o.testid ?? "authfly-form" });
export const group = (gap: string, o: { justify?: string }, kids: N[]): N => ({ k: "group", gap, justify: o.justify, kids });
/** A Box / Text primitive with a tag (dl, dt, dd, ul, li, strong, span, ...), literal token classes (or the muted text
 *  skin) and attributes. inline = the non-React targets print the kids on one line (default: when all kids are leaves). */
export const el = (prim: "Box" | "Text", o: { tag?: string; cls?: string; muted?: boolean; attrs?: Attrs; inline?: boolean }, kids: N[]): N =>
  ({ k: "el", prim, tag: o.tag, cls: o.cls ?? "", muted: o.muted, attrs: o.attrs ?? {}, kids, inline: o.inline });
/** Title (h<level>) with id <widget id>-<idSuffix> (for aria-labelledby). */
export const title = (level: number, idSuffix: string, label: E): N => ({ k: "title", level, idSuffix, label });
export const badge = (variant: E, label: E, testid?: string): N => ({ k: "badge", variant, label, testid });
/** Decorative Separator. */
export const separator = (cls: string): N => ({ k: "separator", cls });
/** A text space between inline kids ({" "} in JSX). */
export const sp = (): N => ({ k: "sp" });
export const hidden = (name: string, value: E): N => ({ k: "hidden", name, value });
export const field = (f: { label: E; name: string; type: E | string; autocomplete: E | string; required?: boolean; hint?: E; addon?: Addon; inputmode?: string }): N =>
  ({ k: "field", label: f.label, name: f.name, type: ex(f.type), autocomplete: ex(f.autocomplete), required: f.required ?? false, hint: f.hint, addon: f.addon, inputmode: f.inputmode });
/** Checkbox + its Label in a Group (gap 2, plus extra classes); the checkbox carries the form error (aria-describedby,
 *  aria-invalid) since it has no Field of its own. */
export const checkbox = (c: { name: string; label: E; required?: boolean; extra?: string }): N =>
  ({ k: "checkbox", name: c.name, label: c.label, required: c.required ?? false, extra: c.extra ?? "" });
export const button = (b: { type?: "submit"; href?: E; variant: "default" | "outline"; extra?: string; testid?: string; attrs?: Attrs }, kids: N[]): N =>
  ({ k: "button", type: b.type, href: b.href, variant: b.variant, extra: b.extra ?? "", testid: b.testid, attrs: b.attrs ?? {}, kids });
export const submit = (testid: string, label: E): N => ({ k: "submit", testid, label });
export const link = (href: E, label: E, testid: string, extra?: string): N => ({ k: "link", href, label, testid, extra });
export const foot = (lead: E, href: E, testid: string, label: E): N => ({ k: "foot", lead, href, testid, label });
export const icon = (name: E): N => ({ k: "icon", name });
export const iconBadge = (icon: E, tone: E): N => ({ k: "iconBadge", icon, tone });
/** A Text line with literal utility classes (tokens only) and a test id. */
export const para = (v: E, cls: string, testid: string): N => ({ k: "para", v, cls, testid });
export const text = (v: E): N => ({ k: "text", v });

export type Prop = { name: string; ts: string; def?: string | boolean; optional?: boolean };
export type Widget = {
  name: string; // sign-in -> authfly-sign-in
  component: string; // AuthflySignIn
  doc: string;
  labelsType: string;
  props: Prop[];
  body: N[];
  /** Card: extra skin classes and attributes after data-testid. */
  card?: { extra?: string; attrs?: Attrs };
  lets?: { name: string; e: E }[];
};
export const widget = (w: Widget) => w;
