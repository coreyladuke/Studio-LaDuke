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

const validId = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/iu;
const maxBytes = 16 * 1024;

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
  `);
  const insert = db.prepare("INSERT INTO requests (id, reference, brief) VALUES (?, ?, ?) ON CONFLICT (id) DO NOTHING");
  const findId = db.prepare("SELECT reference, brief FROM requests WHERE id = ?");
  const advance = db.prepare("UPDATE requests SET status = ? WHERE reference = ? AND status = ?");
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
      return row && { ...row, brief: JSON.parse(row.brief) };
    },
    update(reference, status) {
      const row = this.show(reference);
      if (!row || !nextStates[row.status].includes(status)) return false;
      return advance.run(status, reference, row.status).changes === 1;
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
