// Authfly request: kind email (forgot / magic link) | password (reset: password + confirm, token hidden) | code.
import { widget, prop, lab, eq, orv, head, messages, when, form, hidden, field, submit, link } from "../../src/dsl";

const kind = (v: string) => eq(prop("kind"), v);

export default widget({
  name: "request",
  component: "AuthflyRequest",
  doc: "Authfly request on UI8Kit 3 primitives: forgot (email), reset (password + confirm, token hidden), code. Props as xgen.",
  labelsType: "RequestLabels",
  props: [
    { name: "id", ts: "string" },
    { name: "title", ts: "string" },
    { name: "text", ts: "string" },
    { name: "action", ts: "string" },
    { name: "csrf", ts: "string", def: "" },
    { name: "error", ts: "string", def: "" },
    { name: "info", ts: "string", def: "" },
    { name: "labels", ts: "RequestLabels" },
    { name: "token", ts: "string", def: "" },
    { name: "kind", ts: '"email" | "password" | "code"', def: "email" },
    { name: "landmarkLabel", ts: "string", optional: true },
  ],
  body: [
    head(),
    messages(prop("info")),
    form([
      hidden("csrf", prop("csrf")),
      when(kind("email"), [field({ label: lab("field"), name: "email", type: "email", autocomplete: "email", required: true })]),
      when(kind("password"), [
        hidden("token", prop("token")),
        field({ label: lab("field"), name: "password", type: "password", autocomplete: "new-password", required: true }),
        field({ label: orv(lab("confirm"), ""), name: "confirm", type: "password", autocomplete: "new-password", required: true }),
      ]),
      when(kind("code"), [field({ label: lab("field"), name: "code", type: "text", inputmode: "numeric", autocomplete: "one-time-code", required: true })]),
      submit("submit", lab("submit")),
    ]),
    when(lab("back"), [link(lab("backHref"), lab("back"), "back", "w-fit text-sm")], { inline: true }),
  ],
});
