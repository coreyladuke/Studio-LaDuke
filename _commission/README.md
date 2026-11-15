# Commission Mission Control

The GitHub Pages page at `/commissions/` prepares, reviews, and downloads a brief in the browser. The repository version has no send endpoint. Do not change the blank `data-endpoint` until intake is actually ready. Keep private artist tools, client files and preview assets outside this repository and its host.

## Local workflow

Run the queue tests with Node 24 using `node --test _commission/queue.test.mjs`. The HTTP handler accepts a same-origin JSON POST to `/api/commissions`. Configure the expected origin at the server, and route only POST requests to the handler. A response with `status: received` and a reference follows a committed SQLite insert. Retries use the same request ID and cannot silently change a saved brief.

Use a protected SQLite path outside the web root. For development with synthetic requests only, the operator can run `node _commission/operator.mjs /absolute/private/queue.sqlite list`. The `show REFERENCE` and `update REFERENCE STATUS` commands use machine-level filesystem access. There is no public request lookup or proof endpoint. The reference is a receipt identifier and does not grant inbox access.

The draft state model supports review, quote, acceptance, creation, proof and revision, approval, payment pending, and delivery. Only the artist sets the scope, usage license, price and timing. The state flags are manual. They do not send email, record payments, confirm licenses, or deliver files.

## Before accepting client briefs

1. Select an approved intake host with HTTPS, authenticated artist access, durable private storage, access logging that excludes request bodies, ingress throttling and abuse controls, and a tested retention/deletion policy.
2. Agree on public offerings, reply channel, contact handling, and a privacy notice. Choose between an approved HTTPS intake endpoint and an approved studio email workflow. Enable receipt UI only for an endpoint that confirms persistence.
3. Exercise test-mode request, queue review, notification and retry. Keep paid production systems disabled until Corey approves them.
4. Add proof storage and verified client access with expiration and revocation, then quote, revision and usage-terms UI. Only approved, watermarked proofs are served. Use a verified hosted checkout with server-verified payment before protected delivery, after provider and terms are approved.

## Artist inbox and owner SMS

For local-only review, set `COMMISSION_DB` to the same absolute private database path and `COMMISSION_ARTIST_PASSWORD` to a generated 32-byte hexadecimal secret. Run `node _commission/artist-local.mjs` and sign in as `artist`. The runner binds to loopback. An external artist URL requires an approved HTTPS host and a private access gateway or equivalent identity-backed access. Keep the database outside the served tree and restrict access at the filesystem level. The inbox shows the brief, its reference, the notification outcome, and available status updates. Creative tools and working files stay separately private.

Each newly saved request adds one SMS job. After sender registration and owner opt-in, schedule `node _commission/notify.mjs` on the approved host, for example once a minute. Set `COMMISSION_SMS_ENABLED=true`, `TWILIO_ACCOUNT_SID`, `TWILIO_MESSAGING_SERVICE_SID`, `TWILIO_AUTH_TOKEN`, `COMMISSION_OWNER_PHONE` in E.164 format, and `COMMISSION_ARTIST_URL` to the protected HTTPS URL ending in `/artist/`. Keep values in the host's secret store. The text contains the reference and authenticated link. Client details stay in the inbox. A provider acceptance is not carrier delivery. Failed or uncertain SMS jobs require operator review before any resend. Older requests created before this migration do not generate retroactive texts.

## Next payment and delivery batch

After the artist approves the scope and quote, add a client-specific private proof link with expiration and revocation. The artist can upload a flattened preview and attach the final files and usage terms in private storage. Use an approved provider's hosted checkout for the agreed amount. On a verified, matching paid event, make an expiring download available to that customer and send the delivery notice once. Do not grant download access from the checkout redirect alone. The payment provider, private proof and delivery paths are not configured by this change.
