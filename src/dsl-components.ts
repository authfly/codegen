// Middle-layer component specs (specs/components/<name>.def.ts), printed into the 9 targets by src/components.ts.
// Each kind is one shape of Authfly component over a UI8Kit primitive; add kinds only as components need them.

/** surface: a primitive (Box) with a default tag and a skin recipe; class merged through the skin, rest passed on. */
export type Surface = { kind: "surface"; name: string; tag: string; skin: string; prim: "box" };
/** message: Box with a tone skin, role alert (destructive) or status, aria-live polite, an optional leading Lucide icon. */
export type Message = { kind: "message"; name: string; skin: string; prim: "box" };
/** pill: Text tag span with a variant skin, plus its large icon tile (`tile`, a Lucide glyph in a toned span). */
export type Pill = { kind: "pill"; name: string; skin: string; prim: "text"; tile: { name: string; skin: string } };
/** heading: Text h1 (title size) or h2/h3 (subtitle size); `macro` = the server macro name when it differs. */
export type Heading = { kind: "heading"; name: string; prim: "text"; macro?: string };
/** glyph: a Lucide glyph (the shared LUCIDE table) inside the Icon primitive; `macro` = the server macro name. */
export type Glyph = { kind: "glyph"; name: string; prim: "icon"; macro?: string };
/** layout: Stack (column, gap 4, stretch) and Group (row, gap 2, center) over Box with the 8px-step gap / align /
 * justify tables, Form over the Form primitive (method post, grid gap-4, form-level error id for Field), and on the
 * server targets the box / text primitive wrappers the other macros build on. */
export type Layout = { kind: "layout"; name: string };
/** field: Field (label + control + hint + error; aria-describedby = own ids + hint + field error + form error,
 * aria-invalid when the field or the form shows an error), the form-level error context (React/Solid context, Vue
 * injection key, Svelte context) and Hidden (value always emitted; templ also TextInput, the wired Input). */
export type FieldKind = { kind: "field"; name: string };
/** parts: the shared widget parts over the middle layer: WidgetHead (head), Messages (error / info alerts), the
 * landmark / error-id / control / submit helpers (React, Solid, WC _parts; templ blocks.templ authLink, buttonLink,
 * submit, footLine, addonInput; server link / button macros) and the component index (re-export) files. */
export type Parts = { kind: "parts"; name: string };
export type Component = Surface | Message | Pill | Heading | Glyph | Layout | FieldKind | Parts;
export const surface = (c: Omit<Surface, "kind">): Surface => ({ kind: "surface", ...c });
export const message = (c: Omit<Message, "kind">): Message => ({ kind: "message", ...c });
export const pill = (c: Omit<Pill, "kind">): Pill => ({ kind: "pill", ...c });
export const heading = (c: Omit<Heading, "kind">): Heading => ({ kind: "heading", ...c });
export const glyph = (c: Omit<Glyph, "kind">): Glyph => ({ kind: "glyph", ...c });
export const layout = (c: Omit<Layout, "kind">): Layout => ({ kind: "layout", ...c });
export const field = (c: Omit<FieldKind, "kind">): FieldKind => ({ kind: "field", ...c });
export const parts = (c: Omit<Parts, "kind">): Parts => ({ kind: "parts", ...c });
