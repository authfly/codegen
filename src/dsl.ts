// Widget spec DSL: one typed tree per Authfly widget, printed into the 9 targets by src/emit/*.
// Same idea as ui8kit/codegen bricks (bricks/<name>/<name>.def.ts -> emitters), one level up: the nodes are the
// Authfly middle layer (Card, Field, Stack, ...) and UI8Kit primitives, not raw elements.

/** Expressions. prop = widget prop (default from the spec), lab = labels.<k>, item = current each() item field. */
export type E =
  | { k: "prop"; n: string }
  | { k: "lab"; n: string }
  | { k: "item"; n: string }
  | { k: "lit"; v: string }
  | { k: "eq"; a: E; v: string }
  | { k: "iff"; c: E; a: E; b: E }
  | { k: "cat"; parts: E[] };
export const prop = (n: string): E => ({ k: "prop", n });
export const lab = (n: string): E => ({ k: "lab", n });
export const item = (n: string): E => ({ k: "item", n });
export const lit = (v: string): E => ({ k: "lit", v });
export const eq = (a: E, v: string): E => ({ k: "eq", a, v });
export const iff = (c: E, a: E | string, b: E | string): E => ({ k: "iff", c, a: ex(a), b: ex(b) });
export const cat = (...parts: (E | string)[]): E => ({ k: "cat", parts: parts.map(ex) });
export const ex = (v: E | string): E => (typeof v === "string" ? lit(v) : v);

export type Attrs = Record<string, E>;
/** Nodes: the Authfly middle layer + the primitives a widget uses directly. */
export type N =
  | { k: "head" }
  | { k: "messages"; info?: E }
  | { k: "when"; c: E; kids: N[] }
  | { k: "each"; list: string; kids: N[] }
  | { k: "stack"; gap: string; attrs: Attrs; kids: N[] }
  | { k: "form"; kids: N[] }
  | { k: "hidden"; name: string; value: E }
  | { k: "field"; label: E; name: string; type: E; autocomplete: E; required: boolean; hint?: E; addon?: Addon }
  | { k: "checkbox"; name: string; label: E; required: boolean; extra: string }
  | { k: "button"; href?: E; variant: "default" | "outline"; extra: string; testid?: string; attrs: Attrs; kids: N[] }
  | { k: "submit"; testid: string; label: E }
  | { k: "link"; href: E; extra?: string; testid: string; label: E }
  | { k: "foot"; lead: E; href: E; testid: string; label: E }
  | { k: "icon"; name: E }
  | { k: "text"; v: E };
/** Addon: muted text after the input in a Group (e.g. the mail domain), id = <widget id>-<id>, linked to the input via
 *  aria-describedby only when the text is non-blank. */
export type Addon = { id: string; testid: string; text: E };
export const head = (): N => ({ k: "head" });
export const messages = (info?: E): N => ({ k: "messages", info });
export const when = (c: E, kids: N[]): N => ({ k: "when", c, kids });
export const each = (list: string, kids: N[]): N => ({ k: "each", list, kids });
export const stack = (gap: string, attrs: Attrs, kids: N[]): N => ({ k: "stack", gap, attrs, kids });
export const form = (kids: N[]): N => ({ k: "form", kids });
export const hidden = (name: string, value: E): N => ({ k: "hidden", name, value });
export const field = (f: { label: E; name: string; type: E | string; autocomplete: E | string; required?: boolean; hint?: E; addon?: Addon }): N =>
  ({ k: "field", label: f.label, name: f.name, type: ex(f.type), autocomplete: ex(f.autocomplete), required: f.required ?? false, hint: f.hint, addon: f.addon });
/** Checkbox + its Label in a Group (gap 2, plus extra classes); the checkbox carries the form error (aria-describedby,
 *  aria-invalid) since it has no Field of its own. */
export const checkbox = (c: { name: string; label: E; required?: boolean; extra?: string }): N =>
  ({ k: "checkbox", name: c.name, label: c.label, required: c.required ?? false, extra: c.extra ?? "" });
export const button = (b: { href?: E; variant: "default" | "outline"; extra?: string; testid?: string; attrs?: Attrs }, kids: N[]): N =>
  ({ k: "button", href: b.href, variant: b.variant, extra: b.extra ?? "", testid: b.testid, attrs: b.attrs ?? {}, kids });
export const submit = (testid: string, label: E): N => ({ k: "submit", testid, label });
export const link = (href: E, label: E, testid: string, extra?: string): N => ({ k: "link", href, label, testid, extra });
export const foot = (lead: E, href: E, testid: string, label: E): N => ({ k: "foot", lead, href, testid, label });
export const icon = (name: E): N => ({ k: "icon", name });
export const text = (v: E): N => ({ k: "text", v });

export type Prop = { name: string; ts: string; def?: string; optional?: boolean };
export type Widget = {
  name: string; // sign-in -> authfly-sign-in
  component: string; // AuthflySignIn
  doc: string;
  labelsType: string;
  props: Prop[];
  body: N[];
};
export const widget = (w: Widget) => w;
