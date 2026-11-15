import { createServer } from "node:http";
import { isAbsolute } from "node:path";
import { artistInbox } from "./artist.mjs";
import { openQueue } from "./queue.mjs";

const path = process.env.COMMISSION_DB;
const password = process.env.COMMISSION_ARTIST_PASSWORD;
const port = Number(process.env.COMMISSION_ARTIST_PORT || 4182);
if (!path || !isAbsolute(path)) throw new Error("Set COMMISSION_DB to an absolute private database path.");
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Set a valid local port.");

process.umask(0o077);
const queue = openQueue(path);
const origin = `http://127.0.0.1:${port}`;
const inbox = artistInbox(queue, { password, origin });
createServer((req, res) => {
  inbox(req, res).catch(() => {
    if (!res.headersSent) res.writeHead(500, { "Cache-Control": "no-store" });
    res.end("Artist inbox unavailable.");
  });
}).listen(port, "127.0.0.1", () => console.log(origin + "/artist/"));
