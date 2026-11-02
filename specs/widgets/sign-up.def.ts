// Authfly sign-up: name, username at the mail domain (addon), password with a hint, terms (show | none).
// Props identical to xgen.
import { widget, prop, lab, eq, head, messages, when, form, hidden, field, checkbox, submit, foot } from "../../src/dsl";

export default widget({
  name: "sign-up",
  component: "AuthflySignUp",
  doc: "Authfly sign-up on UI8Kit 3 primitives: name, username at the mail domain, password, terms. Props identical to xgen.",
  labelsType: "SignUpLabels",
  props: [
    { name: "id", ts: "string" },
    { name: "title", ts: "string" },
    { name: "text", ts: "string" },
    { name: "action", ts: "string" },
    { name: "csrf", ts: "string", def: "" },
    { name: "error", ts: "string", def: "" },
    { name: "info", ts: "string", def: "" },
    { name: "labels", ts: "SignUpLabels" },
    { name: "terms", ts: '"show" | "none"', def: "show" },
    { name: "landmarkLabel", ts: "string", optional: true },
  ],
  body: [
    head(),
    messages(prop("info")),
    form([
      hidden("csrf", prop("csrf")),
      field({ label: lab("name"), name: "name", type: "text", autocomplete: "name" }),
      field({ label: lab("username"), name: "username", type: "text", autocomplete: "username", required: true, addon: { id: "domain", testid: "domain", text: lab("domain") } }),
      field({ label: lab("password"), name: "password", type: "password", autocomplete: "new-password", required: true, hint: lab("hint") }),
      when(eq(prop("terms"), "show"), [checkbox({ name: "terms", label: lab("terms"), required: true, extra: "w-fit" })]),
      submit("submit", lab("submit")),
    ]),
    when(lab("signinLink"), [foot(lab("signinText"), lab("signinHref"), "signin-link", lab("signinLink"))]),
  ],
});
