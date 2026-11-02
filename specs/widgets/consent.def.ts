// Authfly OIDC consent: account, requested scopes (list), deny / approve (two forms).
import { widget, prop, lab, lit, item, cat, head, messages, el, sp, text, stack, title, each, icon, group, form, hidden, button } from "../../src/dsl";

const s = (f: string) => item(f, "s");
const decision = (value: string, variant: "default" | "outline") =>
  form([hidden("csrf", prop("csrf")), hidden("decision", lit(value)), button({ type: "submit", variant, extra: "w-full" }, [text(lab(value))])],
    { extra: "flex-1", errorId: false, testid: value });

export default widget({
  name: "consent",
  component: "AuthflyConsent",
  doc: "Authfly OIDC consent on UI8Kit 3 primitives: account, requested scopes, deny / approve. Props as xgen.",
  labelsType: "ConsentLabels",
  props: [
    { name: "id", ts: "string" },
    { name: "title", ts: "string" },
    { name: "text", ts: "string" },
    { name: "action", ts: "string" },
    { name: "csrf", ts: "string", def: "" },
    { name: "error", ts: "string", def: "" },
    { name: "info", ts: "string", def: "" },
    { name: "client", ts: "string" },
    { name: "account", ts: "string" },
    { name: "scopes", ts: "Feature[]" },
    { name: "labels", ts: "ConsentLabels" },
    { name: "landmarkLabel", ts: "string", optional: true },
  ],
  card: { attrs: { "data-client": prop("client") } },
  body: [
    head(),
    messages(prop("info")),
    el("Text", { cls: "text-sm text-foreground", attrs: { "data-testid": lit("account") }, inline: true }, [
      text(lab("account")), sp(), el("Text", { tag: "strong", cls: "font-semibold" }, [text(prop("account"))]),
    ]),
    stack("2", {}, [
      title(2, "scopes", lab("scopes")),
      el("Box", { tag: "ul", cls: "m-0 flex list-none flex-col gap-2 p-0", attrs: { "aria-labelledby": cat(prop("id"), "-scopes"), "data-testid": lit("scopes") } }, [
        each("scopes", [el("Box", { tag: "li", cls: "flex items-center gap-2 text-sm text-foreground", attrs: { "data-scope": s("id") } }, [icon(lit("check")), text(s("title"))])], "s"),
      ]),
    ]),
    group("2", { justify: "between" }, [decision("deny", "outline"), decision("approve", "default")]),
  ],
});
