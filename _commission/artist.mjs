import { timingSafeEqual, createHash } from "node:crypto";
import { briefRows } from "../commissions/brief.mjs";
import { artistTransitions } from "./queue.mjs";

const route = /^\/artist\/(SLD-[A-F0-9]{16})?$/u;
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
*{box-sizing:border-box}body{margin:0;padding:1rem;background:#2c2119;color:#261d15;font:1rem/1.5 Georgia,serif}
main{max-width:48rem;margin:auto;background:#f4e8d2;border:1px solid #9d7855;padding:clamp(1rem,5vw,2.5rem)}
h1,h2{line-height:1.15}ul{padding-left:1.2rem}li{margin-bottom:.65rem}a{color:#5a2c11;text-underline-offset:.2em}
a,button,select{display:inline-flex;min-height:44px;align-items:center}button,select{font:inherit}
:focus-visible{outline:3px solid #356496;outline-offset:3px}dt{font-weight:bold}dd{margin:0 0 .65rem;white-space:pre-wrap;overflow-wrap:anywhere}
</style><main><a href="/artist/">Commission Mission Control</a><h1>${title}</h1>${body}</main></html>`;
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
    if (req.method === "POST" && reference) {
      if (req.headers.origin !== origin) return respond(res, 403, "Open this request from the artist inbox.");
      if (req.headers["content-type"]?.split(";")[0] !== "application/x-www-form-urlencoded") {
        return respond(res, 415, "A form update is required.");
      }
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req.iterator({ destroyOnReturn: false })) {
        bytes += chunk.length;
        if (bytes > 1024) {
          res.setHeader("Connection", "close");
          req.resume();
          return respond(res, 413, "Update too large.");
        }
        chunks.push(chunk);
      }
      const fields = new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
      const next = fields.get("status");
      const current = queue.show(reference);
      if (!current) return respond(res, 404, "Request not found.");
      if (fields.get("from") !== current.status || !artistTransitions(current.status).includes(next) ||
          !queue.update(reference, next, current.status)) {
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
    const available = artistTransitions(request.status);
    const form = available.length ? `<form method="post"><input type="hidden" name="from" value="${escape(request.status)}"><label for="status">Next step</label>
<select id="status" name="status" required><option value="">Choose</option>
${available.map(value => `<option value="${value}">${labels[value]}</option>`).join("")}
</select> <button type="submit">Save status</button></form>` : "";
    const sms = queue.notification(reference);
    return respond(res, 200, page(reference, `<p>${escape(labels[request.status])} · ${escape(request.created_at)} UTC</p>
${sms ? `<p>${escape(smsLabels[sms.status])}</p>` : ""}
<dl>${brief}</dl>${form}`));
  };
}
