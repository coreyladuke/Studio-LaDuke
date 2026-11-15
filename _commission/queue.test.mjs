import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { openQueue, commissionEndpoint } from "./queue.mjs";

test("intake only acknowledges durable, valid briefs and retries resolve to the same receipt", async t => {
  const directory = await mkdtemp(join(tmpdir(), "studio-queue-"));
  const path = join(directory, "requests.sqlite");
  let queue = openQueue(path);
  let handle;
  const server = createServer((req, res) => handle(req, res));
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  handle = commissionEndpoint(queue, origin);
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    queue.close();
    await rm(directory, { recursive: true, force: true });
  });

  const url = origin + "/api/commissions";
  const body = {
    requestId: randomUUID(),
    brief: {
      service: "formline", usage: "personal", material: "cardstock", budgetExample: "example-50",
      portfolioPermission: "no", project: "A small original print for the entryway.", size: "8 × 10 inches",
      format: "Painted cardstock", references: "No clan crest.", deadline: "Flexible", budget: "$50 example",
      email: "visitor@example.test"
    }
  };
  const headers = { Origin: origin, "Content-Type": "application/json" };
  const post = (data, requestHeaders = headers) => fetch(url, {
    method: "POST", headers: requestHeaders, body: JSON.stringify(data)
  });

  assert.equal((await fetch(url)).status, 405);
  assert.equal((await post(body, { ...headers, Origin: "https://elsewhere.example" })).status, 403);
  assert.equal((await post(body, { Origin: origin, "Content-Type": "text/plain" })).status, 415);
  assert.equal((await fetch(url, { method: "POST", headers, body: "{" })).status, 400);
  assert.equal((await post({ requestId: "123", brief: body.brief })).status, 400);
  assert.equal((await post({ ...body, brief: { ...body.brief, email: "" } })).status, 422);
  assert.equal((await post({ ...body, brief: { ...body.brief, project: "x".repeat(17000) } })).status, 413);
  assert.deepEqual(queue.list(), []);

  const response = await post(body);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const receipt = await response.json();
  assert.match(receipt.reference, /^SLD-[A-F0-9]{16}$/u);
  assert.deepEqual(Object.keys(receipt).sort(), ["reference", "status"]);
  assert.equal((await post({ ...body, brief: { ...body.brief, project: "Different work with the same request ID." } })).status, 409);
  queue.close();
  queue = openQueue(path);
  handle = commissionEndpoint(queue, origin);
  assert.deepEqual(await (await post(body)).json(), receipt);
  assert.equal(queue.list().length, 1);
  assert.equal(queue.show(receipt.reference).brief.email, "visitor@example.test");
  assert.equal(queue.update(receipt.reference, "delivered"), false);
  assert.equal(queue.update(receipt.reference, "reviewing"), true);
  assert.equal(queue.update(receipt.reference, "quote-ready"), true);
});

test("quote, clarification, and decline records obey artist workflow state", t => {
  const queue = openQueue(":memory:");
  t.after(() => queue.close());
  const brief = {
    service: "formline", usage: "commercial", material: "digital", budgetExample: "example-250",
    portfolioPermission: "later", project: "A custom formline logo for a synthetic fishing guide.",
    size: "Horizontal", format: "SVG and PNG", references: "Salmon, cedar, no clan crest.",
    deadline: "Next month", budget: "$250 example", email: "synthetic@example.test"
  };
  const reference = queue.receive(randomUUID(), brief);
  assert.equal(queue.requestClarification(reference, "Which business name should appear in the final lockup?", "received"), true);
  assert.equal(queue.show(reference).status, "reviewing");
  assert.equal(queue.show(reference).latestAction.kind, "clarification");
  assert.equal(queue.saveQuote(reference, {
    scope: "One original logo direction with SVG and transparent PNG exports.",
    priceCents: 25000, depositCents: 5000, timing: "First proof in 3–5 business days",
    revisions: 2, usageTerms: "Commercial logo use. Corey retains copyright."
  }, "reviewing"), true);
  assert.equal(queue.show(reference).status, "quote-ready");
  assert.equal(queue.show(reference).quote.priceCents, 25000);
  assert.throws(() => queue.saveQuote(reference, { scope: "too short" }, "quote-ready"));
});
