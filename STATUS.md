# JobBooker site — status

Last updated: **July 21, 2026**.

## Current state

- Live site: https://getjobbooker.com
- Live API: https://api.getjobbooker.com
- Position: managed lead recovery for 1–10 truck roofing, HVAC, and plumbing
  companies—not a generic AI receptionist.
- Public offer everywhere: **$99 first month, then $500/month,
  month-to-month, for the first three pilot companies per trade.**
- Instantly campaign remains at status `0` and is **not sending**. Its three
  steps now use the privacy-first audit/managed-recovery copy and retain STOP.
- One controlled seed from `ben@jobbooker-team.com` to Ben's owned Gmail inbox
  reached Inbox with authenticated headers and the full footer.
- A real isolated campaign proved automatic STOP ingestion and workspace
  suppression for both the reply From address and original contacted alias.
- Live revalidation narrowed the personal send shortlist to Knox Roofing and
  Proactive Air Conditioning. Clean Air Services and Red's Services Group are
  held because their current booking paths use Housecall Pro, which JobBooker
  does not advertise as a native integration.
- Ben then explicitly authorized Knox and Proactive. Each was sent exactly one
  personalized message through a separate one-lead Instantly campaign. Both
  provider payloads matched the approved copy, and both campaigns are now
  paused with no sender attached. The 244-lead bulk draft stayed inactive.
- Same-day API recheck: both threads show only the original send event; no
  reply, bounce, complaint, or STOP on either.
- Day-4 (July 25) and day-10 (July 31) threaded follow-ups for both threads
  are drafted in `.context/first-pilot-followups.md` — NOT sent; each requires
  named authorization. Any reply/bounce/STOP kills that thread's follow-ups.
- Batch 2 sent July 21: Fort Tex delivered complete; Texas Pride queued
  (sender daily limit, delivers next window). Incident: McKinzie, Morales,
  and Direct Source first went out with EMPTY bodies because Instantly's API
  strips text from step bodies containing `<br>` tags (reproduced; newline
  bodies are safe). Corrections with the full approved copy were sent the
  same day and verified complete (16:12–16:21 UTC); all campaigns paused and
  detached. Stale Knox/Proactive Wave-1 lead records deleted to free the
  250-lead plan cap and prevent double-contact.
- All three Instantly mailboxes report warmup active, setup complete, score
  100. Additional owned-inbox seed proofs for the two unused mailboxes remain
  gated on explicit approval.
- Demo assets captured in `.context/assets/` (home, sandbox, audit, and a
  live sandbox session screenshot). One-page pilot intake form added at
  backend `docs/pilot-intake-form.md`.
- Housecall Pro import scoping recorded at backend
  `docs/housecall-pro-integration.md`: webhook path is 1–2 days but gated to
  the prospect's HCP MAX plan; email-parse fallback works on any plan.

## Deployed site behavior

- One offer and transparent fit section; the old standard tier, comparison
  generalizations, FormSubmit dependency, and unsupported $162/38%/85% claims
  are removed.
- Dated/source-linked Invoca, InsideSales, and SearchLight reference facts.
- Verified capability matrix: live now, onboarding-activated, and planned.
  Full voice and native Jobber/Housecall Pro are explicitly not advertised as
  live. Appointment reminders/review requests are onboarding-only and use
  confirmed bookings, consent-gated delivery, and an approved review link.
- Live roofing/HVAC/plumbing sandbox uses the production conversation engine
  with side-effect-free adapters, 15-minute expiry, eight-message cap, five
  sessions per network/day, 500-character limit, and contact-data rejection.
- Privacy-first CSV audit calculates entirely in the browser and submits only
  aggregates. Audit requests now go to the JobBooker API, which queues both the
  acknowledgement and owner alert through the durable worker.
- Optional SMS consent is separate and unchecked; phone is disabled otherwise.
  Frequency/rates, STOP, and the mobile-number no-sharing statement are shown.
- Privacy Policy and Terms are live and included in `sitemap.xml`.

## Verification

- Static checks: `node --check app.js` and `node tests/site-checks.mjs` pass.
- Browser-tested locally and live at 1440px and 390px: no horizontal overflow,
  trade personalization works, keyboard submission works, sandbox and audit
  success/failure states render, and console warnings/errors are zero.
- Browser network capture proved the audit POST contained contact details,
  attribution, and aggregate metrics only—no CSV rows.
- Local HVAC sandbox completed through service ZIP, hazard negation, two slots,
  and the explicit no-real-booking confirmation.
- Live site-to-API CORS passed and a live plumbing sandbox message returned from
  the production engine. HTTPS curl smokes completed all three trades with
  `side_effects=false`.
- Live audit smoke request was accepted; acknowledgement and owner alert both
  reached `sent` with provider IDs/timestamps through the worker. The stored
  request was labelled industry benchmark and had no phone/raw rows.
- API `/health` exposes only health/version; compatibility intake is 401 without
  auth. Calendar-unavailable smoke returned an honest no-booking/no-alert-recipient
  response. The two exact fake smoke leads and their 20 messages were then
  removed; no bookings/deliveries existed and the DB quick check remained OK.
- The July 21 controlled outreach seed was provider-accepted and reached Gmail
  Inbox one second later. SPF, DKIM, and DMARC passed; the website, ad
  disclosure, supplied Varna address, and STOP text rendered intact with no
  unresolved variables. The campaign remained inactive with no sender account.
- The preview test exposed that non-campaign replies were not reliable Unibox
  input. A real one-message campaign then passed: Gmail replied STOP, Instantly
  recorded the event, and the scheduled VPS timer automatically blocked both
  the reply address and contacted alias. Fresh imports of both returned
  `Lead is in blocklist.`
- The four staged recipients were re-read live. Each has one untouched active
  record in the 244-lead draft, zero historical email/contact/bounce/
  unsubscribe evidence, no exact-address or domain suppression match, a
  current public address on its official site, and resolving MX. Instantly has
  no verification result for them, so the checks do not claim guaranteed
  deliverability. Knox and Proactive were the only eligible pair and have now
  been sent once; Clean Air and Red's remain held.
- Instantly recorded one campaign-send event for Knox at `14:45:40Z` and one
  for Proactive at `14:59:10Z`. Each event's subject and normalized text body
  matched the approved hashes exactly. Immediate checks showed no reply or
  provider bounce signal; this is provider-send evidence, not independent
  inbox-placement or human-receipt proof.

## Deployment

- GitHub Pages publishes `main` from
  `github.com/benthepythondev00/jobbooker-site` with custom domain/HTTPS.
- The concurrent reminder/review commit on `origin/main` was merged and its
  capability retained only behind the onboarding label.
- The backend pilot-ready branch is merged and pushed to the private agency
  repo's `main`. VPS API, outbox worker, reminder timer, daily 90-day PII purge,
  and one-minute outreach opt-out timer are active; production DB schema is
  version 4 with WAL and foreign keys.
- Verified pre-migration backup:
  `/opt/jobbooker/backups/jobbooker.db.pre-pilot-ready-20260721T121600Z`.

## Remaining activation blockers

- Any additional sending mailbox needs its own owned-inbox seed/reply proof
  before it can be attached.
- A real Google Calendar event cannot be proven until the first pilot supplies
  approved credentials, calendar, timezone, ZIPs, notice, duration, horizon,
  and escalation recipient.
- Twilio remains inactive until that pilot has approved Messaging Service/A2P,
  a lawful opt-in path, signed webhooks, and client-specific credentials.
- No real lead source/client key or native Jobber/Housecall Pro integration is
  active yet. The sample client has no escalation recipient or review link.
- There is no client-confirmed closed revenue, testimonial, logo, or case study.

## Next exact step

Monitor the two isolated threads for bounce, reply, complaint, or STOP events;
the one-minute VPS suppression timer remains active. Answer any reply in
writing, send nothing else without a new named authorization, and keep the
244-lead draft inert. On/after July 25, request authorization for the day-4
follow-ups (or cancel per thread if a reply lands). Batch-2 candidates are
staged for named authorization whenever approved. If a prospect accepts, run
the real source, Calendar success/failure, acknowledgement, owner-alert,
consent, and reporting acceptance checks using `docs/pilot-intake-form.md`.
