import { randomBytes } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { validateBrief } from "../commissions/brief.mjs";

const nextStates = {
  received: ["reviewing", "declined"],
  reviewing: ["quote-ready", "declined"],
  "quote-ready": ["accepted", "reviewing", "declined"],
  accepted: ["creating", "declined"],
  creating: ["proof-ready"],
  "proof-ready": ["revision-requested", "approved"],
  "revision-requested": ["creating", "proof-ready"],
  approved: ["awaiting-payment"],
  "awaiting-payment": ["delivered"],
  delivered: [],
  declined: []
};

export function artistTransitions(status) {
  return (nextStates[status] ?? []).filter(next => next !== "delivered");
}

const validId = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/iu;
const maxBytes = 16 * 1024;

function cleanText(value, name, max, minimum = 1) {
  if (typeof value !== "string") throw new Error(`Check ${name}.`);
  const clean = value.trim().replaceAll("\r\n", "\n");
  if (clean.length < minimum || clean.length > max || /[\x00-\x08\x0B-\x1F\x7F]/u.test(clean)) throw new Error(`Check ${name}.`);
  return clean;
}

export function validateQuote(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Enter a quote.");
  const priceCents = Number(input.priceCents);
  const depositCents = Number(input.depositCents || 0);
  const revisions = Number(input.revisions);
  if (!Number.isSafeInteger(priceCents) || priceCents < 100 || priceCents > 10_000_000) throw new Error("Check price.");
  if (!Number.isSafeInteger(depositCents) || depositCents < 0 || depositCents > priceCents) throw new Error("Check deposit.");
  if (!Number.isSafeInteger(revisions) || revisions < 0 || revisions > 20) throw new Error("Check revisions.");
  return {
    scope: cleanText(input.scope, "scope", 2000, 10),
    priceCents,
    timing: cleanText(input.timing, "timing", 300),
    revisions,
    usageTerms: cleanText(input.usageTerms, "usage terms", 1500, 10),
    depositCents
  };
}

export function openQueue(path) {
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA busy_timeout = 2500;
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      brief TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'received',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
    CREATE TABLE IF NOT EXISTS sms_outbox (
      reference TEXT PRIMARY KEY REFERENCES requests(reference),
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sending', 'accepted', 'failed', 'uncertain')),
      provider_id TEXT
    ) STRICT;
    CREATE TABLE IF NOT EXISTS artist_actions (
      id INTEGER PRIMARY KEY,
      reference TEXT NOT NULL REFERENCES requests(reference),
      kind TEXT NOT NULL CHECK (kind IN ('clarification', 'decline')),
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
    CREATE TABLE IF NOT EXISTS quotes (
      reference TEXT PRIMARY KEY REFERENCES requests(reference),
      quote TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
    CREATE TRIGGER IF NOT EXISTS commission_sms_after_insert
    AFTER INSERT ON requests
    BEGIN
      INSERT INTO sms_outbox (reference) VALUES (NEW.reference);
    END;
  `);
  const insert = db.prepare("INSERT INTO requests (id, reference, brief) VALUES (?, ?, ?) ON CONFLICT (id) DO NOTHING");
  const findId = db.prepare("SELECT reference, brief FROM requests WHERE id = ?");
  const advance = db.prepare("UPDATE requests SET status = ? WHERE reference = ? AND status = ?");
  const transaction = work => {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = work();
      db.exec("COMMIT");
      return result;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  };
  return {
    receive(id, payload) {
      if (typeof id !== "string" || !validId.test(id)) throw new RequestError(400);
      const normalizedId = id.toLowerCase();
      let brief;
      try {
        brief = JSON.stringify(validateBrief(payload));
      } catch {
        throw new RequestError(422);
      }
      insert.run(normalizedId, `SLD-${randomBytes(8).toString("hex").toUpperCase()}`, brief);
      const row = findId.get(normalizedId);
      if (row.brief !== brief) throw new RequestError(409);
      return row.reference;
    },
    list() {
      return db.prepare("SELECT reference, status, created_at FROM requests ORDER BY created_at DESC, reference").all();
    },
    show(reference) {
      const row = db.prepare("SELECT reference, status, created_at, brief FROM requests WHERE reference = ?").get(reference);
      if (!row) return undefined;
      const quote = db.prepare("SELECT quote, created_at, updated_at FROM quotes WHERE reference = ?").get(reference);
      const action = db.prepare("SELECT kind, message, created_at FROM artist_actions WHERE reference = ? ORDER BY id DESC LIMIT 1").get(reference);
      return {
        ...row,
        brief: JSON.parse(row.brief),
        quote: quote && { ...JSON.parse(quote.quote), created_at: quote.created_at, updated_at: quote.updated_at },
        latestAction: action
      };
    },
    notification(reference) {
      return db.prepare("SELECT status, provider_id FROM sms_outbox WHERE reference = ?").get(reference);
    },
    claimNotification() {
      return db.prepare(`
        UPDATE sms_outbox SET status = 'sending'
        WHERE reference = (
          SELECT reference FROM sms_outbox WHERE status = 'pending' ORDER BY rowid LIMIT 1
        ) RETURNING reference
      `).get();
    },
    finishNotification(reference, status, providerId = null) {
      return db.prepare(`
        UPDATE sms_outbox SET status = ?, provider_id = ?
        WHERE reference = ? AND status = 'sending'
      `).run(status, providerId, reference).changes === 1;
    },
    update(reference, status, expectedStatus) {
      const row = this.show(reference);
      if (!row || (expectedStatus && row.status !== expectedStatus) || !nextStates[row.status].includes(status)) return false;
      return advance.run(status, reference, row.status).changes === 1;
    },
    requestClarification(reference, message, expectedStatus) {
      const row = this.show(reference);
      if (!row || row.status !== expectedStatus || !["received", "reviewing"].includes(row.status)) return false;
      const clean = cleanText(message, "clarification", 1500, 10);
      const save = () => transaction(() => {
        db.prepare("INSERT INTO artist_actions (reference, kind, message) VALUES (?, 'clarification', ?)").run(reference, clean);
        if (row.status === "received") advance.run("reviewing", reference, "received");
      });
      save();
      return true;
    },
    decline(reference, message, expectedStatus) {
      const row = this.show(reference);
      if (!row || row.status !== expectedStatus || !["received", "reviewing", "quote-ready"].includes(row.status)) return false;
      const clean = cleanText(message, "decline note", 1500, 10);
      const save = () => transaction(() => {
        db.prepare("INSERT INTO artist_actions (reference, kind, message) VALUES (?, 'decline', ?)").run(reference, clean);
        advance.run("declined", reference, row.status);
      });
      save();
      return true;
    },
    saveQuote(reference, input, expectedStatus) {
      const row = this.show(reference);
      if (!row || row.status !== expectedStatus || !["received", "reviewing", "quote-ready"].includes(row.status)) return false;
      const quote = validateQuote(input);
      const save = () => transaction(() => {
        db.prepare(`
          INSERT INTO quotes (reference, quote) VALUES (?, ?)
          ON CONFLICT(reference) DO UPDATE SET quote = excluded.quote, updated_at = CURRENT_TIMESTAMP
        `).run(reference, JSON.stringify(quote));
        if (row.status !== "quote-ready") advance.run("quote-ready", reference, row.status);
      });
      save();
      return true;
    },
    close() { db.close(); }
  };
}

class RequestError extends Error {
  constructor(status) {
    super("Commission request rejected.");
    this.status = status;
  }
}

function respond(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(data));
}

export function commissionEndpoint(queue, origin) {
  return async (request, response) => {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      respond(response, 405, { status: "rejected" });
      return;
    }
    if (request.headers.origin !== origin) {
      respond(response, 403, { status: "rejected" });
      return;
    }
    if (request.headers["content-type"]?.split(";")[0].trim() !== "application/json") {
      respond(response, 415, { status: "rejected" });
      return;
    }
    try {
      const chunks = [];
      let bytes = 0;
      // Keep control of the stream on an oversized payload long enough to deliver the rejection.
      for await (const chunk of request.iterator({ destroyOnReturn: false })) {
        bytes += chunk.length;
        if (bytes > maxBytes) throw new RequestError(413);
        chunks.push(chunk);
      }
      let data;
      try {
        data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        throw new RequestError(400);
      }
      if (!data || typeof data !== "object") throw new RequestError(400);
      const reference = queue.receive(data.requestId, data.brief);
      respond(response, 200, { status: "received", reference });
    } catch (error) {
      if (error.status === 413) {
        response.setHeader("Connection", "close");
        request.resume();
      }
      respond(response, error instanceof RequestError ? error.status : 500, { status: "rejected" });
    }
  };
}
