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

## Deployment

- GitHub Pages publishes `main` from
  `github.com/benthepythondev00/jobbooker-site` with custom domain/HTTPS.
- The concurrent reminder/review commit on `origin/main` was merged and its
  capability retained only behind the onboarding label.
- The backend pilot-ready branch is merged and pushed to the private agency
  repo's `main`. VPS API, outbox worker, reminder timer, and daily 90-day PII
  purge timer are active; production DB schema is version 4 with WAL and
  foreign keys.
- Verified pre-migration backup:
  `/opt/jobbooker/backups/jobbooker.db.pre-pilot-ready-20260721T121600Z`.

## Remaining activation blockers

- A real Google Calendar event cannot be proven until the first pilot supplies
  approved credentials, calendar, timezone, ZIPs, notice, duration, horizon,
  and escalation recipient.
- Twilio remains inactive until that pilot has approved Messaging Service/A2P,
  a lawful opt-in path, signed webhooks, and client-specific credentials.
- No real lead source/client key or native Jobber/Housecall Pro integration is
  active yet. The sample client has no escalation recipient or review link.
- There is no client-confirmed closed revenue, testimonial, logo, or case study.

## Next exact step

Onboard the first pilot in writing, activate one real source plus its owner
recipient, pass a real Google Calendar success and forced-failure check, then
send one consented lead and confirm provider-backed acknowledgement within 60
seconds of JobBooker receipt and a reconciled report. Keep Instantly paused
until those real-client gates pass; campaign activation remains a separate
explicit decision.
