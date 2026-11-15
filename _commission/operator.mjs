import { isAbsolute } from "node:path";
import { openQueue } from "./queue.mjs";

const [path, command, reference, status] = process.argv.slice(2);
if (!path || !isAbsolute(path) || !["list", "show", "update"].includes(command) ||
    (command !== "list" && !/^SLD-[A-F0-9]{16}$/u.test(reference ?? "")) ||
    (command === "update" && !status)) {
  console.error("Usage: node operator.mjs /absolute/private/queue.sqlite list | show REFERENCE | update REFERENCE STATUS");
  process.exitCode = 1;
} else {
  process.umask(0o077);
  const queue = openQueue(path);
  try {
    if (command === "list") console.log(JSON.stringify(queue.list(), null, 2));
    if (command === "show") console.log(JSON.stringify(queue.show(reference) ?? null, null, 2));
    if (command === "update" && !queue.update(reference, status)) {
      console.error("Unknown reference or invalid status transition.");
      process.exitCode = 1;
    }
  } finally {
    queue.close();
  }
}
