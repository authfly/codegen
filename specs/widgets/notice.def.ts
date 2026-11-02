// Authfly notice: check email, verified, link error, sign out (action form). tone error = alert, else status.
import { widget, prop, lab, eq, iff, local, head, when, form, hidden, submit, button, link, text, iconBadge, para } from "../../src/dsl";

export default widget({
  name: "notice",
  component: "AuthflyNotice",
  doc: "Authfly notice on UI8Kit 3 primitives: check email, verified, link error, sign out (form). Props as xgen.",
  labelsType: "NoticeLabels",
  props: [
    { name: "id", ts: "string" },
    { name: "title", ts: "string" },
    { name: "text", ts: "string" },
    { name: "detail", ts: "string", def: "" },
    { name: "icon", ts: "string", def: "mail-check" },
    { name: "labels", ts: "NoticeLabels" },
    { name: "actionUrl", ts: "string", def: "" },
    { name: "csrf", ts: "string", def: "" },
    { name: "tone", ts: '"default" | "success" | "error"', def: "default" },
    { name: "action", ts: '"link" | "form"', def: "link" },
    { name: "landmarkLabel", ts: "string", optional: true },
  ],
  card: { extra: "items-center text-center", attrs: { "data-tone": prop("tone") } },
  lets: [{ name: "isError", e: eq(prop("tone"), "error") }],
  body: [
    iconBadge(prop("icon"), iff(local("isError"), "destructive", "default")),
    head({ align: "center", role: iff(local("isError"), "alert", "status"), kids: [
      when(prop("detail"), [para(prop("detail"), "text-sm font-semibold text-foreground", "detail")], { inline: true }),
    ] }),
    when(eq(prop("action"), "form"), [
      form([hidden("csrf", prop("csrf")), submit("submit", lab("cta"))], { action: "actionUrl", extra: "w-full", errorId: false }),
    ], { els: [button({ href: lab("ctaHref"), variant: "default", extra: "w-full", testid: "cta" }, [text(lab("cta"))])] }),
    when(lab("secondary"), [link(lab("secondaryHref"), lab("secondary"), "secondary", "text-sm")], { inline: true }),
  ],
});
