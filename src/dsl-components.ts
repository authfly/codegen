// Middle-layer component specs (specs/components/<name>.def.ts), printed into the 9 targets by src/components.ts.
// Each kind is one shape of Authfly component over a UI8Kit primitive; add kinds only as components need them.

/** surface: a primitive (Box) with a default tag and a skin recipe; class merged through the skin, rest passed on. */
export type Surface = { kind: "surface"; name: string; tag: string; skin: string; prim: "box" };
export type Component = Surface;
export const surface = (c: Omit<Surface, "kind">): Surface => ({ kind: "surface", ...c });
