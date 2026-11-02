// Alert: inline message (error / info). role alert for the destructive tone, status otherwise; aria-live polite.
import { message } from "../../src/dsl-components";

export default message({ name: "alert", skin: "alert", prim: "box" });
