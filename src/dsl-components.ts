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
export type Component = Surface | Message | Pill | Heading | Glyph;
export const surface = (c: Omit<Surface, "kind">): Surface => ({ kind: "surface", ...c });
export const message = (c: Omit<Message, "kind">): Message => ({ kind: "message", ...c });
export const pill = (c: Omit<Pill, "kind">): Pill => ({ kind: "pill", ...c });
export const heading = (c: Omit<Heading, "kind">): Heading => ({ kind: "heading", ...c });
export const glyph = (c: Omit<Glyph, "kind">): Glyph => ({ kind: "glyph", ...c });
