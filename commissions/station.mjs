import { services, validateBrief, briefRows } from "./brief.mjs";

const form = document.querySelector("#mission");
const options = document.querySelector("#service-options");
const review = document.querySelector("#review");
const output = document.querySelector("#review-fields");
const status = document.querySelector("#review-status");
const error = document.querySelector("#form-error");
const receipt = document.querySelector("#receipt");
const send = document.querySelector("#send");
const edit = document.querySelector("#edit");
const endpoint = form.dataset.endpoint === "/api/commissions" ? form.dataset.endpoint : null;
let brief;
let requestId;

for (const service of services) {
  const label = document.createElement("label");
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "service";
  radio.value = service.id;
  radio.required = true;
  const text = document.createElement("span");
  const description = document.createElement("small");
  description.textContent = service.description;
  text.append(service.name, description);
  label.append(radio, text);
  options.append(label);
}
form.hidden = false;

if (endpoint) {
  document.querySelector("#intake-state").textContent = "Review your brief first. You can send it to Corey for review or save a copy.";
  document.querySelector("#review-hint").textContent = "Sending shares these details and your reply email with the studio for review.";
  send.hidden = false;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  try {
    const revised = validateBrief(Object.fromEntries(new FormData(form)));
    if (JSON.stringify(revised) !== JSON.stringify(brief)) requestId = undefined;
    brief = revised;
    output.replaceChildren();
    for (const [key, value] of briefRows(brief)) {
      const term = document.createElement("dt");
      const entry = document.createElement("dd");
      term.textContent = key;
      entry.textContent = value;
      output.append(term, entry);
    }
    error.hidden = true;
    status.textContent = "";
    form.hidden = true;
    review.hidden = false;
    document.querySelector("#review-title").focus();
  } catch (problem) {
    error.textContent = problem.message;
    error.hidden = false;
    error.focus();
  }
});

edit.addEventListener("click", () => {
  review.hidden = true;
  form.hidden = false;
  form.querySelector("#project").focus();
});

document.querySelector("#download").addEventListener("click", () => {
  const body = briefRows(brief).map(([key, value]) => `${key}: ${value}`).join("\n\n");
  const url = URL.createObjectURL(new Blob([`Studio LaDuke · Commission Mission Control\n\n${body}\n`], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "studio-laduke-project-brief.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = "Download requested. No information was sent.";
});

send.addEventListener("click", async () => {
  if (!endpoint || send.disabled) return;
  send.disabled = true;
  edit.disabled = true;
  status.textContent = "Sending your brief…";
  try {
    requestId ??= crypto.randomUUID();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, brief }),
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error("Request failed.");
    const result = await response.json();
    if (result.status !== "received" || !/^SLD-[0-9A-F]{16}$/u.test(result.reference)) throw new Error("Receipt missing.");
    document.querySelector("#receipt-reference").textContent = result.reference;
    review.hidden = true;
    receipt.hidden = false;
    document.querySelector("#receipt-title").focus();
    form.reset();
    output.replaceChildren();
    brief = undefined;
  } catch {
    status.textContent = "We couldn’t confirm receipt. Retry to check, or download a copy of your brief.";
  } finally {
    send.disabled = false;
    edit.disabled = false;
  }
});
