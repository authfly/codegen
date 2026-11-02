// Authfly account: profile (name, email + verified badge), sign-in methods (list), sign out (form).
import { widget, prop, lab, lit, item, cat, iff, head, el, text, badge, separator, stack, title, each, icon, form, hidden, button } from "../../src/dsl";

const m = (f: string) => item(f, "m");
const verified = prop("verified");

export default widget({
  name: "account",
  component: "AuthflyAccount",
  doc: "Authfly account on UI8Kit 3 primitives: profile, verified badge, sign-in methods, sign out. Props as xgen.",
  labelsType: "AccountLabels",
  props: [
    { name: "id", ts: "string" },
    { name: "title", ts: "string" },
    { name: "text", ts: "string" },
    { name: "name", ts: "string" },
    { name: "email", ts: "string" },
    { name: "verified", ts: "boolean", def: false },
    { name: "methods", ts: "Feature[]" },
    { name: "labels", ts: "AccountLabels" },
    { name: "signoutUrl", ts: "string" },
    { name: "csrf", ts: "string", def: "" },
    { name: "landmarkLabel", ts: "string", optional: true },
  ],
  card: { extra: "max-w-lg" },
  body: [
    head(),
    el("Box", { tag: "dl", cls: "m-0 grid gap-4", attrs: { "data-testid": lit("profile") } }, [
      el("Box", { cls: "grid gap-2" }, [
        el("Box", { tag: "dt", muted: true }, [text(lab("name"))]),
        el("Box", { tag: "dd", cls: "m-0 font-semibold text-foreground", attrs: { "data-testid": lit("profile-name") } }, [text(prop("name"))]),
      ]),
      el("Box", { cls: "grid gap-2" }, [
        el("Box", { tag: "dt", muted: true }, [text(lab("email"))]),
        el("Box", { tag: "dd", cls: "m-0 flex flex-wrap items-center gap-2 font-semibold text-foreground", attrs: { "data-testid": lit("profile-email") } }, [
          text(prop("email")),
          badge(iff(verified, "default", "secondary"), iff(verified, lab("verified"), lab("unverified")), "verified"),
        ]),
      ]),
    ]),
    separator("w-full border-border"),
    stack("2", {}, [
      title(2, "methods", lab("security")),
      el("Box", { tag: "ul", cls: "m-0 flex list-none flex-col gap-2 p-0", attrs: { "aria-labelledby": cat(prop("id"), "-methods"), "data-testid": lit("methods") } }, [
        each("methods", [
          el("Box", { tag: "li", cls: "flex items-center justify-between gap-4 text-sm text-foreground", attrs: { "data-method": m("id") } }, [
            el("Text", { tag: "span", cls: "flex items-center gap-2" }, [icon(iff(m("icon"), m("icon"), "shield")), text(m("title"))]),
            badge(lit("outline"), m("text")),
          ]),
        ], "m"),
      ]),
    ]),
    form([hidden("csrf", prop("csrf")), button({ type: "submit", variant: "outline", extra: "w-full", testid: "signout" }, [icon(lit("log-out")), text(lab("signout"))])],
      { action: "signoutUrl", errorId: false, testid: "signout-form" }),
  ],
});
