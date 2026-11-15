const number = /^\+[1-9][0-9]{7,14}$/u;
const serviceId = /^MG[0-9a-f]{32}$/iu;
const accountId = /^AC[0-9a-f]{32}$/iu;
const messageId = /^SM[0-9a-f]{32}$/iu;

export function twilioSms({ account, messagingService, token, phone, inbox }, fetcher = fetch) {
  const destination = new URL(inbox);
  if (destination.protocol !== "https:" || destination.username || destination.password ||
      destination.search || destination.hash || destination.pathname !== "/artist/" ||
      !accountId.test(account) || !serviceId.test(messagingService) || !token || !number.test(phone)) {
    throw new Error("Configure an approved SMS sender, private recipient and HTTPS artist inbox.");
  }
  return async reference => {
    const link = new URL(reference, destination);
    const response = await fetcher(`https://api.twilio.com/2010-04-01/Accounts/${account}/Messages.json`, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: "Basic " + Buffer.from(account + ":" + token).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        To: phone,
        MessagingServiceSid: messagingService,
        Body: `New Studio LaDuke commission ${reference}. Review: ${link.href}`
      })
    });
    // A timeout or server error may occur after acceptance. Leave it for manual reconciliation.
    if (response.status >= 500) throw new Error("Provider outcome unconfirmed.");
    if (!response.ok) return { status: "failed" };
    const data = await response.json();
    if (!messageId.test(data.sid)) throw new Error("Missing message receipt.");
    if (["failed", "undelivered", "canceled"].includes(data.status)) {
      return { status: "failed", providerId: data.sid };
    }
    return { status: "accepted", providerId: data.sid };
  };
}

export async function sendNextNotification(queue, send) {
  const job = queue.claimNotification();
  if (!job) return null;
  let result;
  try {
    result = await send(job.reference);
  } catch {
    result = { status: "uncertain" };
  }
  queue.finishNotification(job.reference, result.status, result.providerId);
  return { ...job, status: result.status };
}
