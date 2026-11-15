import { isAbsolute } from "node:path";
import { openQueue } from "./queue.mjs";
import { twilioSms, sendNextNotification } from "./sms.mjs";

const env = process.env;
if (env.COMMISSION_SMS_ENABLED !== "true" || !env.COMMISSION_DB || !isAbsolute(env.COMMISSION_DB)) {
  throw new Error("SMS is disabled. An approved sender and an absolute private database path are required.");
}
const send = twilioSms({
  account: env.TWILIO_ACCOUNT_SID,
  messagingService: env.TWILIO_MESSAGING_SERVICE_SID,
  token: env.TWILIO_AUTH_TOKEN,
  phone: env.COMMISSION_OWNER_PHONE,
  inbox: env.COMMISSION_ARTIST_URL
});

process.umask(0o077);
const queue = openQueue(env.COMMISSION_DB);
try {
  for (let count = 0; count < 10; count += 1) {
    const result = await sendNextNotification(queue, send);
    if (!result) break;
    console.log(result.reference, result.status);
    if (result.status !== "accepted") {
      process.exitCode = 1;
      break;
    }
  }
} finally {
  queue.close();
}
