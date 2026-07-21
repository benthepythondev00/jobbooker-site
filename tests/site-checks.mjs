import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const pages = ["index.html", "privacy.html", "terms.html", "roofing.html", "hvac.html", "plumbing.html"];
const combined = pages.map(read).join("\n");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const file of pages) {
  const text = read(file);
  assert(/<!doctype html>/i.test(text), `${file}: missing doctype`);
  assert(/<html[^>]*lang="en"/i.test(text), `${file}: missing language`);
  assert(/<meta name="viewport"/i.test(text), `${file}: missing viewport`);
  assert(/<title>[^<]+<\/title>/i.test(text), `${file}: missing title`);
  assert(/<\/html>\s*$/i.test(text), `${file}: document is not closed`);
}

for (const prohibited of [
  "$2,500", "$750", "FormSubmit", "85%", "38%", "$162",
  "often annual", "annual contracts", "Works with Jobber / Housecall Pro"
]) {
  assert(!combined.includes(prohibited), `prohibited stale claim remains: ${prohibited}`);
}

assert(combined.includes("$99 first month"), "pilot first-month price missing");
assert(combined.includes("$500 per month"), "pilot ongoing price missing");
assert(read("index.html").includes("$5,599"), "year-one ROI cost is inconsistent");
assert(read("index.html").includes("Live now"), "capability live status missing");
assert(read("index.html").includes("Onboarding"), "capability onboarding status missing");
assert(read("index.html").includes("Planned"), "capability planned status missing");
assert(read("index.html").includes("/v1/audit-requests") === false,
  "API implementation should remain in app.js");
assert(read("app.js").includes('apiRequest("/v1/audit-requests"'),
  "audit endpoint is not wired");
assert(read("app.js").includes('apiRequest("/demo/sessions"'),
  "demo endpoint is not wired");
assert(!read("app.js").includes("FormData(auditForm)"),
  "raw form/CSV submission path detected");
assert(read("privacy.html").includes("do not sell or share mobile numbers"),
  "mobile no-sharing disclosure missing");
assert(read("index.html").includes("Reply STOP to opt out"),
  "SMS STOP disclosure missing");
assert(read("lead-audit-template.csv").split("\n")[0] ===
  "received_at,first_response_at,source,booked,job_value",
  "sanitized CSV schema mismatch");

const jsonLdMatch = read("index.html").match(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
assert(jsonLdMatch, "JSON-LD missing");
const jsonLd = JSON.parse(jsonLdMatch[1]);
assert(jsonLd.offers.price === "99", "JSON-LD first-month price is not $99");
assert(jsonLd.offers.description.includes("$500 per month"),
  "JSON-LD ongoing price is not $500/month");

for (const file of ["styles.css", "app.js", "lead-audit-template.csv", "privacy.html", "terms.html"]) {
  assert(fs.existsSync(path.join(root, file)), `missing local asset: ${file}`);
}

console.log("site checks passed");
