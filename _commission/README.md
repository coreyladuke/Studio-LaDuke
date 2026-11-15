# Commission Mission Control

The GitHub Pages page at `/commissions/` prepares, reviews, and downloads a brief in the browser. The repository version has no send endpoint. Do not change the blank `data-endpoint` until intake is actually ready. Keep private artist tools, client files and preview assets outside this repository and its host.

## Local workflow

Run the queue tests with Node 24 using `node --test _commission/queue.test.mjs`. The HTTP handler accepts a same-origin JSON POST to `/api/commissions`. Configure the expected origin at the server, and route only POST requests to the handler. A response with `status: received` and a reference follows a committed SQLite insert. Retries use the same request ID and cannot silently change a saved brief.

Use a protected SQLite path outside the web root. For development with synthetic requests only, the operator can run `node _commission/operator.mjs /absolute/private/queue.sqlite list`. The `show REFERENCE` and `update REFERENCE STATUS` commands use machine-level filesystem access. There is no public request lookup, artist login, or proof endpoint. The reference is a receipt identifier.

The draft state model supports review, quote, acceptance, creation, proof and revision, approval, payment pending, and delivery. Only the artist sets the scope, usage license, price and timing. The state flags are manual. They do not send email, record payments, confirm licenses, or deliver files.

## Before accepting client briefs

1. Select an approved intake host with HTTPS, authenticated artist access, durable private storage, access logging that excludes request bodies, ingress throttling and abuse controls, and a tested retention/deletion policy.
2. Agree on public offerings, reply channel, contact handling, and a privacy notice. Choose between an approved HTTPS intake endpoint and an approved studio email workflow. Enable receipt UI only for an endpoint that confirms persistence.
3. Exercise test-mode request, queue review, notification and retry. Keep paid production systems disabled until Corey approves them.
4. Add proof storage and verified client access with expiration and revocation, then quote, revision and usage-terms UI. Only approved, watermarked proofs are served. Use a verified hosted checkout with server-verified payment before protected delivery, after provider and terms are approved.
