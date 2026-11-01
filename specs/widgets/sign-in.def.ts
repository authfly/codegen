// Authfly sign-in. Axes: method (password | magic), identifier (any | email | username),
// social (none | show: provider buttons, an extension point). Props identical to the xgen widget.
import { widget, prop, lab, item, eq, iff, cat, head, messages, when, each, stack, form, hidden, field, button, submit, link, foot, icon, text } from "../../src/dsl";

const email = eq(prop("identifier"), "email");

export default widget({
  name: "sign-in",
  component: "AuthflySignIn",
  doc: "Authfly sign-in on UI8Kit 3 primitives. Axes: method (password | magic), identifier (any | email | username),\nsocial (none | show: provider buttons, an extension point). Props identical to the xgen widget.",
  labelsType: "SignInLabels",
  props: [
    { name: "id", ts: "string" },
    { name: "title", ts: "string" },
    { name: "text", ts: "string" },
    { name: "action", ts: "string" },
    { name: "csrf", ts: "string", def: "" },
    { name: "error", ts: "string", def: "" },
    { name: "labels", ts: "SignInLabels" },
    { name: "providers", ts: "Feature[]" },
    { name: "method", ts: '"password" | "magic"', def: "password" },
    { name: "identifier", ts: '"any" | "email" | "username"', def: "any" },
    { name: "social", ts: '"none" | "show"', def: "none" },
    { name: "landmarkLabel", ts: "string", optional: true },
  ],
  body: [
    head(),
    messages(),
    when(eq(prop("social"), "show"), [
      stack("2", { role: { k: "lit", v: "group" }, "aria-label": lab("providers"), "data-testid": { k: "lit", v: "authfly-providers" } }, [
        each("providers", [
          button({ href: cat(lab("socialUrl"), "/", item("id")), variant: "outline", extra: "w-full", attrs: { "data-provider": item("id") } }, [icon(item("icon")), text(item("title"))]),
        ]),
      ]),
    ]),
    form([
      hidden("csrf", prop("csrf")),
      field({ label: lab("identifier"), name: "identifier", type: iff(email, "email", "text"), autocomplete: iff(email, "email", "username"), required: true }),
      when(eq(prop("method"), "password"), [
        field({ label: lab("password"), name: "password", type: "password", autocomplete: "current-password", required: true }),
        when(lab("forgot"), [link(lab("forgotHref"), lab("forgot"), "forgot", "w-fit text-sm")]),
      ]),
      submit("submit", lab("submit")),
    ]),
    when(lab("magic"), [button({ href: lab("magicHref"), variant: "outline", extra: "w-full", testid: "switch-method" }, [text(lab("magic"))])]),
    when(lab("signupLink"), [foot(lab("signupText"), lab("signupHref"), "signup-link", lab("signupLink"))]),
  ],
});
