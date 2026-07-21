"use strict";

const API_BASE = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://127.0.0.1:8420"
  : "https://api.getjobbooker.com";
const TRADES = new Set(["roofing", "hvac", "plumbing"]);
const REQUIRED_HEADERS = ["received_at", "first_response_at", "source", "booked", "job_value"];
const FORBIDDEN_HEADER_PARTS = ["name", "email", "phone", "contact", "address", "message", "body"];

const byId = id => document.getElementById(id);
const formatMoney = value => "$" + Math.round(value).toLocaleString("en-US");

function personalizeTrade() {
  const candidate = new URLSearchParams(window.location.search).get("trade")?.toLowerCase();
  if (!TRADES.has(candidate)) return;
  byId("demoTrade").value = candidate;
  byId("auditTrade").value = candidate;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {"Content-Type": "application/json", ...(options.headers || {})}
  });
  let data = {};
  try { data = await response.json(); } catch (_) { /* a proxy may return plain text */ }
  if (!response.ok) {
    const detail = typeof data.detail === "string"
      ? data.detail
      : Array.isArray(data.detail)
        ? data.detail.map(item => item.msg).filter(Boolean).join(" ")
        : "The request could not be completed.";
    throw new Error(detail);
  }
  return data;
}

// Live, side-effect-free sandbox.
let demoSession = null;
const demoStart = byId("demoStart");
const demoForm = byId("demoForm");
const demoInput = byId("demoMessage");
const demoSend = byId("demoSend");
const demoLog = byId("demoLog");
const demoStatus = byId("demoStatus");

function setStatus(element, text, type = "") {
  element.textContent = text;
  element.className = "form-status" + (type ? ` ${type}` : "");
}

function addChatMessage(role, text) {
  const message = document.createElement("p");
  message.className = `chat-message ${role}`;
  message.textContent = text;
  demoLog.appendChild(message);
  demoLog.scrollTop = demoLog.scrollHeight;
}

demoStart.addEventListener("click", async () => {
  demoStart.disabled = true;
  demoInput.disabled = true;
  demoSend.disabled = true;
  setStatus(demoStatus, "Creating an isolated session…");
  try {
    const data = await apiRequest("/demo/sessions", {
      method: "POST",
      body: JSON.stringify({trade: byId("demoTrade").value})
    });
    demoSession = data.session_id;
    demoLog.replaceChildren();
    addChatMessage("assistant", data.message);
    demoInput.disabled = false;
    demoSend.disabled = false;
    demoInput.placeholder = "Describe a job without personal information";
    demoInput.focus();
    setStatus(demoStatus, "Safe session active for 15 minutes. No external actions are possible.", "success");
  } catch (error) {
    demoSession = null;
    setStatus(demoStatus, error.message, "error");
  } finally {
    demoStart.disabled = false;
  }
});

demoForm.addEventListener("submit", async event => {
  event.preventDefault();
  const body = demoInput.value.trim();
  if (!demoSession || !body) return;
  addChatMessage("user", body);
  demoInput.value = "";
  demoInput.disabled = true;
  demoSend.disabled = true;
  setStatus(demoStatus, "Applying the playbook…");
  try {
    const data = await apiRequest(`/demo/sessions/${demoSession}/messages`, {
      method: "POST",
      body: JSON.stringify({body})
    });
    addChatMessage("assistant", data.reply);
    const finished = ["completed", "escalated"].includes(data.state) || data.messages_remaining <= 0;
    if (finished) {
      demoSession = null;
      setStatus(demoStatus, "Session complete. Start another to reset the trade flow.", "success");
    } else {
      demoInput.disabled = false;
      demoSend.disabled = false;
      demoInput.focus();
      setStatus(demoStatus, `${data.messages_remaining} sandbox messages remaining.`);
    }
  } catch (error) {
    setStatus(demoStatus, error.message, "error");
    if (!/expired|limit/i.test(error.message)) {
      demoInput.disabled = false;
      demoSend.disabled = false;
    } else {
      demoSession = null;
    }
  }
});

// ROI scenario. This is intentionally framed as user-entered arithmetic.
function updateCalculator() {
  const missed = Number(byId("missedLeads").value);
  const close = Number(byId("closeRate").value) / 100;
  const value = Number(byId("jobValue").value);
  byId("missedLeadsValue").textContent = String(missed);
  byId("closeRateValue").textContent = `${Math.round(close * 100)}%`;
  byId("jobValueValue").textContent = formatMoney(value);
  byId("scenarioValue").textContent = formatMoney(missed * close * value * 12);
  byId("breakEven").textContent = (5599 / value).toFixed(1);
}
["missedLeads", "closeRate", "jobValue"].forEach(id => byId(id).addEventListener("input", updateCalculator));
updateCalculator();

// CSV parsing happens entirely in this page. Only the resulting aggregate
// object is ever included in the audit-request network payload.
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some(value => value.trim() !== "")) rows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("The CSV has an unclosed quoted field.");
  row.push(cell.replace(/\r$/, ""));
  if (row.some(value => value.trim() !== "")) rows.push(row);
  return rows;
}

function percentile(values, proportion) {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.max(0, Math.ceil(ordered.length * proportion) - 1)];
}

function parseBoolean(value, rowNumber) {
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(normalized)) return true;
  if (["", "0", "false", "no", "n"].includes(normalized)) return false;
  throw new Error(`Row ${rowNumber}: booked must be yes/no or true/false.`);
}

function parseTimestamp(value, label, rowNumber) {
  if (!/(Z|[+-]\d{2}:\d{2})$/i.test(value.trim())) {
    throw new Error(`Row ${rowNumber}: ${label} must include a timezone.`);
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw new Error(`Row ${rowNumber}: invalid ${label}.`);
  return timestamp;
}

function calculateCsvMetrics(text) {
  const parsed = parseCsv(text);
  if (parsed.length < 2) throw new Error("The CSV has no lead rows.");
  if (parsed.length - 1 > 10000) throw new Error("The CSV exceeds the 10,000-row limit.");
  const headers = parsed[0].map(value => value.trim().toLowerCase());
  const personal = headers.filter(header => FORBIDDEN_HEADER_PARTS.some(part => header.includes(part)));
  if (personal.length) throw new Error(`Remove personal-data columns: ${personal.join(", ")}.`);
  const missing = REQUIRED_HEADERS.filter(header => !headers.includes(header));
  if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}.`);
  const index = Object.fromEntries(headers.map((header, position) => [header, position]));
  const responseMinutes = [];
  const sources = new Set();
  let booked = 0;
  parsed.slice(1).forEach((values, offset) => {
    const rowNumber = offset + 2;
    const value = key => (values[index[key]] || "").trim();
    const received = parseTimestamp(value("received_at"), "received_at", rowNumber);
    if (value("first_response_at")) {
      const responded = parseTimestamp(value("first_response_at"), "first_response_at", rowNumber);
      if (responded < received) throw new Error(`Row ${rowNumber}: first response precedes receipt.`);
      responseMinutes.push((responded - received) / 60000);
    }
    if (value("source")) sources.add(value("source").slice(0, 80));
    booked += Number(parseBoolean(value("booked"), rowNumber));
    const jobValue = value("job_value").replace(/[$,]/g, "");
    if (jobValue && (!Number.isFinite(Number(jobValue)) || Number(jobValue) < 0)) {
      throw new Error(`Row ${rowNumber}: job_value must be blank or a non-negative number.`);
    }
  });
  const middle = responseMinutes.length
    ? [...responseMinutes].sort((a, b) => a - b)
    : [];
  const half = Math.floor(middle.length / 2);
  const median = !middle.length ? null
    : middle.length % 2 ? middle[half] : (middle[half - 1] + middle[half]) / 2;
  return {
    metrics: {
      row_count: parsed.length - 1,
      answered_count: responseMinutes.length,
      unanswered_count: parsed.length - 1 - responseMinutes.length,
      booked_count: booked,
      median_response_minutes: median === null ? null : Number(median.toFixed(1)),
      p95_response_minutes: responseMinutes.length ? Number(percentile(responseMinutes, .95).toFixed(1)) : null,
      industry_benchmark: false
    },
    sources: [...sources]
  };
}

let auditAggregate = {
  metrics: {
    row_count: 0, answered_count: 0, unanswered_count: 0, booked_count: 0,
    median_response_minutes: null, p95_response_minutes: null,
    industry_benchmark: true
  },
  sources: []
};

const auditFile = byId("auditFile");
const fileStatus = byId("fileStatus");
const metricPreview = byId("metricPreview");
auditFile.addEventListener("change", async () => {
  metricPreview.hidden = true;
  auditAggregate = {
    metrics: {row_count: 0, answered_count: 0, unanswered_count: 0, booked_count: 0,
      median_response_minutes: null, p95_response_minutes: null, industry_benchmark: true},
    sources: []
  };
  if (!auditFile.files.length) {
    setStatus(fileStatus, "No file selected. Your request will be labelled as an industry benchmark.");
    return;
  }
  try {
    if (auditFile.files[0].size > 2_000_000) throw new Error("The CSV must be 2 MB or smaller.");
    auditAggregate = calculateCsvMetrics(await auditFile.files[0].text());
    byId("metricRows").textContent = auditAggregate.metrics.row_count;
    byId("metricAnswered").textContent = auditAggregate.metrics.answered_count;
    byId("metricBooked").textContent = auditAggregate.metrics.booked_count;
    byId("metricMedian").textContent = auditAggregate.metrics.median_response_minutes === null
      ? "—" : `${auditAggregate.metrics.median_response_minutes} min`;
    metricPreview.hidden = false;
    setStatus(fileStatus, "Calculated locally. Raw rows will not be uploaded.", "success");
  } catch (error) {
    auditFile.value = "";
    setStatus(fileStatus, error.message, "error");
  }
});

const smsConsent = byId("smsConsent");
const auditPhone = byId("auditPhone");
auditPhone.disabled = true;
smsConsent.addEventListener("change", () => {
  auditPhone.disabled = !smsConsent.checked;
  auditPhone.required = smsConsent.checked;
  if (!smsConsent.checked) auditPhone.value = "";
});

function e164(value) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return trimmed;
}

const auditForm = byId("auditForm");
auditForm.addEventListener("submit", async event => {
  event.preventDefault();
  const submit = byId("auditSubmit");
  const status = byId("auditStatus");
  submit.disabled = true;
  submit.textContent = "Submitting…";
  const params = new URLSearchParams(window.location.search);
  const manualSources = byId("auditSources").value.split(",").map(value => value.trim()).filter(Boolean);
  const sources = [...new Set([...auditAggregate.sources, ...manualSources])].slice(0, 20);
  const payload = {
    name: byId("auditName").value,
    company: byId("auditCompany").value,
    email: byId("auditEmail").value,
    phone: smsConsent.checked ? e164(auditPhone.value) : "",
    website: byId("auditWebsite").value,
    sources,
    trade: byId("auditTrade").value,
    interest: "Free private lead audit",
    sms_consent: smsConsent.checked,
    metrics: auditAggregate.metrics,
    attribution: {
      utm_source: (params.get("utm_source") || "").slice(0, 120),
      utm_medium: (params.get("utm_medium") || "").slice(0, 120),
      utm_campaign: (params.get("utm_campaign") || "").slice(0, 120),
      referrer: document.referrer.slice(0, 500)
    }
  };
  try {
    const data = await apiRequest("/v1/audit-requests", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    auditForm.reset();
    personalizeTrade();
    auditPhone.disabled = true;
    setStatus(status, `Request ${data.request_id.slice(0, 8)} accepted. Check your email for the acknowledgement.`, "success");
    submit.textContent = "Audit request submitted";
  } catch (error) {
    submit.disabled = false;
    submit.textContent = "Submit private audit request";
    setStatus(status, `${error.message} You can also email ben@jobbooker-team.com.`, "error");
  }
});

personalizeTrade();
