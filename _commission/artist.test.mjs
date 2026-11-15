import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import assert from "node:assert/strict";
import test from "node:test";
import { artistInbox } from "./artist.mjs";
import { openQueue, commissionEndpoint } from "./queue.mjs";
import { sendNextNotification, twilioSms } from "./sms.mjs";

const example = {
  service: "formline", usage: "commercial", project: "A private brief with <script>mark()</script> in its description.",
  email: "client@example.test"
};

test("saved customer brief is private and can be reviewed from the authenticated inbox", async t => {
  const queue = openQueue(":memory:");
  let handle;
  const server = createServer((req, res) => handle(req, res));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    queue.close();
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const password = "f".repeat(64);
  const inbox = artistInbox(queue, { origin, password });
  const intake = commissionEndpoint(queue, origin);
  handle = (req, res) => req.url === "/api/commissions" ? intake(req, res) : inbox(req, res);
  const auth = { Authorization: "Basic " + Buffer.from("artist:" + password).toString("base64") };
  const accepted = await fetch(origin + "/api/commissions", {
    method: "POST", headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ requestId: randomUUID(), brief: example })
  });
  assert.equal(accepted.status, 200);
  const { reference } = await accepted.json();
  const detail = origin + "/artist/" + reference;
  for (const url of [origin + "/artist/", detail]) {
    const denial = await fetch(url);
    assert.equal(denial.status, 401);
    assert.equal(denial.headers.get("cache-control"), "no-store");
    assert.doesNotMatch(await denial.text(), /client@example|private brief/);
  }
  const list = await fetch(origin + "/artist/", { headers: auth });
  assert.match(await list.text(), new RegExp(reference));
  const result = await fetch(detail, { headers: auth });
  assert.equal(result.status, 200);
  const html = await result.text();
  assert.match(html, /client@example\.test/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);

  const update = (from, status, requestOrigin = origin) => fetch(detail, {
    method: "POST", redirect: "manual", headers: { ...auth, Origin: requestOrigin },
    body: new URLSearchParams({ from, status })
  });
  assert.equal((await update("received", "reviewing", "https://elsewhere.example")).status, 403);
  assert.equal((await update("received", "delivered")).status, 409);
  assert.equal((await update("received", "reviewing")).status, 303);
  assert.equal((await update("received", "declined")).status, 409);
  assert.equal(queue.show(reference).status, "reviewing");
});

test("SMS reference is queued once and provider acceptance is distinct from delivery", async t => {
  const queue = openQueue(":memory:");
  t.after(() => queue.close());
  const request = randomUUID();
  const reference = queue.receive(request, example);
  assert.equal(queue.receive(request, example), reference);
  assert.equal(queue.notification(reference).status, "pending");
  let calls = 0;
  const sid = "SM" + "a".repeat(32);
  const send = twilioSms({
    account: "AC" + "a".repeat(32), messagingService: "MG" + "a".repeat(32),
    token: "test-only", phone: "+12025550123", inbox: "https://private.example.test/artist/"
  }, async (url, options) => {
    calls += 1;
    assert.match(url, /^https:\/\/api\.twilio\.com\//);
    assert.equal(options.body.get("To"), "+12025550123");
    assert.match(options.body.get("Body"), new RegExp(reference));
    assert.doesNotMatch(options.body.get("Body"), /client@example|private brief/);
    return Response.json({ sid, status: "queued" });
  });
  const replies = await Promise.all([sendNextNotification(queue, send), sendNextNotification(queue, send)]);
  assert.equal(replies.filter(Boolean).length, 1);
  assert.equal(calls, 1);
  assert.equal(queue.notification(reference).status, "accepted");
  assert.equal(queue.notification(reference).provider_id, sid);

  const later = queue.receive(randomUUID(), example);
  await sendNextNotification(queue, async () => { throw new Error("Connection cut off"); });
  assert.equal(queue.notification(later).status, "uncertain");
  assert.equal(await sendNextNotification(queue, send), null);
});
