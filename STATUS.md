# JobBooker site — status

Last updated: **July 22, 2026**.

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
- Batch 2 sent July 21: all five delivered. Incident: McKinzie, Morales,
  and Direct Source first went out with EMPTY bodies because Instantly's API
  strips text from step bodies containing `<br>` tags (reproduced; newline
  bodies are safe). Corrections with the full approved copy were sent the
  same day and verified complete (16:12–16:21 UTC); Texas Pride (16:00:14Z)
  and Fort Tex (15:59:22Z) delivered complete on first send. All batch-2 and
  correction campaigns are paused with no sender attached. All seven active
  threads (2 batch-1, 5 batch-2) show sent events only — zero replies,
  bounces, complaints, or STOPs as of last check. Stale Knox/Proactive
  Wave-1 lead records deleted to free the 250-lead plan cap and prevent
  double-contact.
- All three Instantly mailboxes report warmup active, setup complete, score
  100. Additional owned-inbox seed proofs for the two unused mailboxes remain
  gated on explicit approval.
- Demo assets captured in `.context/assets/` (home, sandbox, audit, and a
  live sandbox session screenshot). One-page pilot intake form added at
  backend `docs/pilot-intake-form.md`.
- Housecall Pro import scoping recorded at backend
  `docs/housecall-pro-integration.md`: webhook path is 1–2 days but gated to
  the prospect's HCP MAX plan; email-parse fallback works on any plan.
  **Implemented July 21** (backend `fecef59`): `POST /webhooks/housecallpro/{slug}`
  with HMAC verification and idempotent intake; 38 backend tests pass.
  Inactive until a client supplies a signing secret.
- Reply playbook staged at `.context/reply-playbook.md` (interested, price,
  skeptic, not-interested, STOP, bounce, HCP scenarios).
- Batch-2 day-4 (Jul 25) and day-10 (Jul 31) follow-ups staged at
  `.context/batch-2-followups.md` — NOT sent; named authorization required.
- Thread monitoring automated: backend `tools/monitor_threads.py` checks all
  7 threads daily at 09:00 via cron, logs to `data/thread-monitor.jsonl` and
  `data/thread-monitor.log`; first run all-clear.
- IndexNow live: key file at site root, all three URLs pushed July 21
  (HTTP 202) — covers Bing, Yahoo, Yandex, Naver, Seznam. Brave Search and
  DuckDuckGo accept no submissions (crawl-based). Google Search Console verified
  July 21 via HTML meta tag (property https://getjobbooker.com/) and
  sitemap.xml submitted by Ben; the verification meta tag stays on the
  homepage permanently. Search data appears in GSC within ~48h.
- Trade landing pages live July 21: /roofing.html, /hvac.html,
  /plumbing.html — trade-specific pain points, playbook, pricing, FAQ,
  per-page Service JSON-LD, added to sitemap, IndexNow-pushed (HTTP 200),
  linked from the index footer. Fixed a plain-list contrast bug and added
  stylesheet cache-busting (styles.css?v=2). Site checks extended to all
  six pages and pass; browser-tested desktop and 390px.
- Demo video recorded: `.context/assets/jobbooker-sandbox-demo.mp4` (41s,
  real plumbing sandbox conversation against the live production engine).
  Usable in follow-ups and the site if wanted.
- Speed-to-lead guides live July 21: /roofing-speed-to-lead.html,
  /hvac-speed-to-lead.html, /plumbing-speed-to-lead.html — sourced benchmark
  facts (Invoca July 2026, InsideSales historical, SearchLight Q1 2026),
  Article JSON-LD, sitemap + IndexNow (HTTP 200), linked from footers.
  Stylesheet bumped to v=3.
- Jobber inbound path implemented (backend `04cca26`):
  `POST /webhooks/jobber/{slug}` with X-Jobber-Hmac-SHA256 verification,
  GraphQL fetch-after-notify, token refresh; 50 backend tests pass. Inactive
  until Ben creates a Jobber Developer Center app (docs/jobber-integration.md)
  and a client connects; Draft cap is 5 accounts.
- Batch 3 (Houston) staged in `.context/pilot-batch-3-houston.md`: six
  vetted candidates (Rose Roofing, EDR Roofing, Cooper Plumbing, Adams Air,
  Hou-Tex Mechanical, Houston A/C Solutions), MX-verified, zero
  history/suppression. NOT sent — named authorization required, and the
  250-lead plan cap must be freed first (prune Wave-1 or upgrade).  **Done July 22**: pruned 10 Wave-1
  leads — the 2 held staged prospects (Clean Air, Red's), 2 test probes
  (test-lead-format-check, probe-ua-check), and 6 previously excluded or
  duplicate-pool leads (Silver Spur, J's, Bridges Air, Cowboy Cooling,
  NexAir, Day & Night Air). Source data remains in the repo, so the prune
  is recoverable. Batch 3 now has send capacity.
- Competition matrix refreshed July 21 (backend `e250183`): key threats —
  ServiceTitan "Speed to Lead" (June 2026, FSM-native sub-minute responder,
  enterprise tiers only), LeadTruffle at $229/mo, Jobber Receptionist at
  $29/mo. Wedge holds: no sub-$99 managed calendar booking for roofers, no
  native sub-minute web-lead responder from Jobber/HCP, and fail-closed
  booking honesty remains unduplicated. Site copy reviewed: no exclusivity
  claims to correct. Revisit pricing pressure if LeadTruffle-style offers
  reach roofing at <$300.
- Note: site repo pushes must target `main` directly (`git push origin
  HEAD:main`); the local feature branch is not what GitHub Pages builds.

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

## Latest checkpoint (July 22, 2026 ~13:08 UTC)

- What changed: live Instantly recheck of all 7 contacted threads.
- Files touched: `data/thread-monitor.jsonl` (agency), this STATUS.
- Commands run: `python3 tools/monitor_threads.py` in
  `ai-frontdesk-agency` → exit 0, all clear.
- Result: every thread still has only our sent events (ue_type=1). Zero
  replies, bounces, complaints, or STOPs. Sent counts: Knox 1, Proactive 1,
  McKinzie 2, Morales 2, Direct Source 2, Texas Pride 1, Fort Tex 1
  (batch-2 empties + same-day corrections still the only extras).
- Note: referenced drafts
  `.context/first-pilot-followups.md`, `.context/batch-2-followups.md`, and
  `.context/pilot-batch-3-houston.md` are **missing on disk** — day-4 and
  Batch 3 auth packets drafted in chat on July 22; recreate those files
  before any send.
- Current blocker: no named authorization for day-4 follow-ups (due on/after
  July 25) or for Houston Batch 3 first-touch sends.
- Next exact step: keep monitoring; on July 25 re-run the monitor and, if
  still silent, get named auth for day-4 only. Do not send Batch 3 until
  candidates are re-vetted into a real staging file (partial lead rows only
  for Rose/Cooper/Houston A/C; EDR/Adams/Hou-Tex not found in current CSVs).

## Next exact step

Monitor all seven Instantly threads for bounce, reply, complaint, or STOP;
the one-minute VPS suppression timer remains active. Answer any reply in
writing, send nothing else without a new named authorization, and keep the
244-lead draft inert. On/after July 25, request authorization for the day-4
follow-ups (or cancel per thread if a reply lands). Batch 3 Houston still
needs a complete staging file before any send auth. If a prospect accepts,
run the real source, Calendar success/failure, acknowledgement, owner-alert,
consent, and reporting acceptance checks using `docs/pilot-intake-form.md`.
