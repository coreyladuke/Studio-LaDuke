import { timingSafeEqual, createHash } from "node:crypto";
import { briefRows } from "../commissions/brief.mjs";
import { artistTransitions } from "./queue.mjs";

const route = /^\/artist\/(?:(SLD-[A-F0-9]{16})(?:\/(workspace))?)?$/u;
const labels = {
  received: "Received", reviewing: "Reviewing", "quote-ready": "Quote ready",
  accepted: "Accepted", creating: "Creating", "proof-ready": "Proof ready",
  "revision-requested": "Revision requested", approved: "Approved",
  "awaiting-payment": "Awaiting payment", delivered: "Delivered", declined: "Declined"
};
const smsLabels = {
  pending: "Waiting for SMS worker", sending: "SMS sending or interrupted",
  accepted: "Accepted by SMS provider", failed: "SMS rejected", uncertain: "SMS result unconfirmed"
};
const escape = value => String(value).replace(/[&<>"']/gu, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);
const digest = value => createHash("sha256").update(value).digest();

function respond(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
  });
  res.end(body);
}

function page(title, body) {
  return `<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Studio LaDuke</title><style>
*{box-sizing:border-box}body{margin:0;padding:.7rem;background:#17110d;color:#261d15;font:1rem/1.5 Georgia,serif}
main{max-width:58rem;margin:auto;padding:clamp(1rem,4vw,2.5rem);background:repeating-linear-gradient(0deg,transparent 0 29px,#8c653417 30px),#f4e8d2;border:1px solid #9d7855;box-shadow:0 8px 28px #000}
h1,h2,h3{line-height:1.1}h1{margin:.55rem 0 1rem}h2{margin:1.6rem 0 .55rem}ul{padding-left:1.2rem}li{margin-bottom:.65rem}a{color:#5a2c11;text-underline-offset:.2em}
a,button,select{display:inline-flex;min-height:44px;align-items:center}button,select,input,textarea{font:inherit}button{padding:.5rem .75rem;border:1px solid #67452b;background:#4e3423;color:#fff0d7;box-shadow:2px 2px #9b7855;font-weight:700;cursor:pointer}
:focus-visible{outline:3px solid #356496;outline-offset:3px}dt{font-weight:bold}dd{margin:0 0 .65rem;white-space:pre-wrap;overflow-wrap:anywhere}
label{display:block;margin-top:.7rem;font-weight:700}input,textarea,select{width:100%;min-height:44px;padding:.45rem .55rem;border:1px solid #80664f;background:#fffaf1;color:#261d15}textarea{resize:vertical}.row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}.action{margin:1rem 0;padding:1rem;border:1px solid #9b7b59;background:#ead7b7}.quote{padding:1rem;border:3px double #775537;background:#fff8e9}.warning{border-left:4px solid #8c3d28;padding:.65rem;background:#ead6b6}.workspace{min-height:18rem;padding:1rem;border:9px solid #3c352e;background:linear-gradient(#48504d,#252927);color:#fff1da;box-shadow:inset 0 0 18px #000}.workspace dl{padding:1rem;background:#111a}.fine{font-size:.9rem}.money{font-size:1.35rem;font-weight:700}
@media(max-width:560px){.row{grid-template-columns:1fr}main{padding:1rem}.action{padding:.75rem}}
</style><main><a href="/artist/">← Commission Mission Control</a><h1>${title}</h1>${body}</main></html>`;
}

const money = cents => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

function quoteHtml(quote) {
  if (!quote) return "";
  return `<section class="quote"><h2>Quote on file</h2><p class="money">${escape(money(quote.priceCents))}</p>
<dl><dt>Scope</dt><dd>${escape(quote.scope)}</dd><dt>Timing</dt><dd>${escape(quote.timing)}</dd>
<dt>Included revisions</dt><dd>${escape(quote.revisions)}</dd><dt>Usage terms</dt><dd>${escape(quote.usageTerms)}</dd>
<dt>Deposit</dt><dd>${escape(quote.depositCents ? money(quote.depositCents) : "No deposit")}</dd></dl>
<p class="fine">This review build does not send the quote, accept payment, or grant delivery access.</p></section>`;
}

export function artistInbox(queue, { origin, password }) {
  if (typeof password !== "string" || !/^[a-f0-9]{64}$/u.test(password)) {
    throw new Error("Set a random 32-byte hexadecimal COMMISSION_ARTIST_PASSWORD.");
  }
  const expected = digest("Basic " + Buffer.from("artist:" + password).toString("base64"));

  return async (req, res) => {
    if (!timingSafeEqual(digest(req.headers.authorization ?? ""), expected)) {
      res.setHeader("WWW-Authenticate", 'Basic realm="Studio LaDuke artist review", charset="UTF-8"');
      return respond(res, 401, "Artist sign-in required.");
    }
    const match = route.exec(new URL(req.url, origin).pathname);
    if (!match) return respond(res, 404, "Not found.");
    const reference = match[1];
    const workspace = match[2] === "workspace";
    if (req.method === "POST" && reference && !workspace) {
      if (req.headers.origin !== origin) return respond(res, 403, "Open this request from the artist inbox.");
      if (req.headers["content-type"]?.split(";")[0] !== "application/x-www-form-urlencoded") {
        return respond(res, 415, "A form update is required.");
      }
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req.iterator({ destroyOnReturn: false })) {
        bytes += chunk.length;
        if (bytes > 10 * 1024) {
          res.setHeader("Connection", "close");
          req.resume();
          return respond(res, 413, "Update too large.");
        }
        chunks.push(chunk);
      }
      const fields = new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
      const current = queue.show(reference);
      if (!current) return respond(res, 404, "Request not found.");
      const from = fields.get("from");
      const action = fields.get("action");
      let saved = false;
      try {
        if (from === current.status && action === "clarify") saved = queue.requestClarification(reference, fields.get("message"), from);
        if (from === current.status && action === "decline") saved = queue.decline(reference, fields.get("message"), from);
        if (from === current.status && action === "quote") saved = queue.saveQuote(reference, {
          scope: fields.get("scope"),
          priceCents: Math.round(Number(fields.get("price")) * 100),
          timing: fields.get("timing"),
          revisions: Number(fields.get("revisions")),
          usageTerms: fields.get("usageTerms"),
          depositCents: Math.round(Number(fields.get("deposit") || 0) * 100)
        }, from);
        if (from === current.status && action === "status") {
          const next = fields.get("status");
          saved = artistTransitions(current.status).includes(next) && queue.update(reference, next, current.status);
        }
      } catch {
        return respond(res, 422, page("Check the update", `<p>The request was not changed. Check every required field and try again.</p><p><a href="/artist/${reference}">Return to the request</a></p>`));
      }
      if (!saved) {
        return respond(res, 409, page("Status changed", `<p><a href="/artist/${reference}">Reopen the request</a> before updating it.</p>`));
      }
      res.setHeader("Cache-Control", "no-store");
      res.writeHead(303, { Location: `/artist/${reference}` }).end();
      return;
    }
    if (req.method !== "GET") {
      res.setHeader("Allow", reference ? "GET, POST" : "GET");
      return respond(res, 405, "Method not allowed.");
    }

    if (!reference) {
      const links = queue.list().map(row =>
        `<li><a href="/artist/${escape(row.reference)}">${escape(row.reference)}</a> · ${escape(labels[row.status])}</li>`
      );
      return respond(res, 200, page("Artist inbox", links.length ? `<ul>${links.join("")}</ul>` : "<p>No requests yet.</p>"));
    }

    const request = queue.show(reference);
    if (!request) return respond(res, 404, "Request not found.");
    const brief = briefRows(request.brief).map(([label, value]) => `<dt>${escape(label)}</dt><dd>${escape(value)}</dd>`).join("");
    if (workspace) {
      if (request.brief.service !== "formline") return respond(res, 404, "No formline workspace for this request.");
      return respond(res, 200, page(`Private workspace · ${reference}`, `<p class="warning"><strong>Artist-only.</strong> The customer cannot see this screen, the private generator, working files, or internal notes.</p>
<section class="workspace"><h2>Selected brief stays beside the work</h2><dl>${brief}</dl>
<p>The private formline generator belongs in this protected workspace. Its source and working files are deliberately not included in the public website repository. This route keeps the selected brief attached without copying it to another screen.</p></section>
<p><a href="/artist/${reference}">Return to the brief and quote controls</a></p>`));
    }
    const available = artistTransitions(request.status);
    const form = available.length ? `<form method="post"><input type="hidden" name="from" value="${escape(request.status)}"><input type="hidden" name="action" value="status"><label for="status">Next step</label>
<select id="status" name="status" required><option value="">Choose</option>
${available.map(value => `<option value="${value}">${labels[value]}</option>`).join("")}
</select> <button type="submit">Save status</button></form>` : "";
    const sms = queue.notification(reference);
    return respond(res, 200, page(reference, `<p>${escape(labels[request.status])} · ${escape(request.created_at)} UTC</p>
${sms ? `<p>${escape(smsLabels[sms.status])}</p>` : ""}
<dl>${brief}</dl>
${request.brief.service === "formline" ? `<p><a href="/artist/${reference}/workspace">Open private formline workspace with this brief →</a></p>` : ""}
${request.latestAction ? `<section class="action"><h2>Latest artist action</h2><p><strong>${escape(request.latestAction.kind)}</strong></p><p>${escape(request.latestAction.message)}</p></section>` : ""}
${quoteHtml(request.quote)}
${["received", "reviewing"].includes(request.status) ? `<section class="action"><h2>Ask for clarification</h2><form method="post"><input type="hidden" name="from" value="${escape(request.status)}"><input type="hidden" name="action" value="clarify"><label for="message">What needs answering?</label><textarea id="message" name="message" minlength="10" maxlength="1500" rows="3" required></textarea><button type="submit">Save clarification request</button></form></section>` : ""}
${["received", "reviewing", "quote-ready"].includes(request.status) ? `<section class="action"><h2>${request.quote ? "Revise quote" : "Offer a quote"}</h2><form method="post"><input type="hidden" name="from" value="${escape(request.status)}"><input type="hidden" name="action" value="quote">
<label for="scope">Exact scope</label><textarea id="scope" name="scope" minlength="10" maxlength="2000" rows="4" required>${escape(request.quote?.scope ?? "")}</textarea>
<div class="row"><div><label for="price">Price</label><input id="price" name="price" type="number" min="1" max="100000" step=".01" value="${request.quote ? request.quote.priceCents / 100 : ""}" required></div><div><label for="deposit">Deposit, if any</label><input id="deposit" name="deposit" type="number" min="0" max="100000" step=".01" value="${request.quote ? request.quote.depositCents / 100 : "0"}" required></div></div>
<div class="row"><div><label for="timing">Estimated timing</label><input id="timing" name="timing" maxlength="300" value="${escape(request.quote?.timing ?? "")}" required></div><div><label for="revisions">Included revisions</label><input id="revisions" name="revisions" type="number" min="0" max="20" value="${escape(request.quote?.revisions ?? 1)}" required></div></div>
<label for="usageTerms">Usage and copyright terms</label><textarea id="usageTerms" name="usageTerms" minlength="10" maxlength="1500" rows="4" required>${escape(request.quote?.usageTerms ?? "Corey LaDuke retains copyright. The customer receives the usage rights described in the accepted quote. Copyright transfer requires a separate written agreement. Portfolio permission remains a separate choice.")}</textarea>
<button type="submit">Save quote</button></form></section>` : ""}
${["received", "reviewing", "quote-ready"].includes(request.status) ? `<section class="action"><h2>Decline this request</h2><form method="post"><input type="hidden" name="from" value="${escape(request.status)}"><input type="hidden" name="action" value="decline"><label for="decline-message">Private reason or customer-facing note</label><textarea id="decline-message" name="message" minlength="10" maxlength="1500" rows="3" required></textarea><button type="submit">Decline request</button></form></section>` : ""}
${form}`));
  };
}
