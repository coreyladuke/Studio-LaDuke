export const services = [
  { id: "formline", name: "Custom formline design", description: "Discuss original artwork or a logo, shaped and reviewed by Corey." },
  { id: "other", name: "Ask about another project", description: "Tell Corey what you have in mind so he can assess the fit." }
];

const usageNames = { personal: "Personal use", commercial: "Business or commercial use", unsure: "Still deciding" };
const limits = { project: 2000, deliverables: 300, references: 500, deadline: 100, budget: 100, email: 254 };

export function validateBrief(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Enter a project brief.");
  const service = services.find(item => item.id === input.service);
  if (!service) throw new Error("Choose a mission.");
  if (!Object.hasOwn(usageNames, input.usage)) throw new Error("Choose how you’ll use the artwork.");
  const brief = { service: service.id, usage: input.usage };
  for (const [key, max] of Object.entries(limits)) {
    const value = input[key] ?? "";
    if (typeof value !== "string" || value.length > max || /[\x00-\x08\x0B-\x1F\x7F]/u.test(value.replaceAll("\r\n", "\n"))) {
      throw new Error(`Check the ${key} field and try again.`);
    }
    brief[key] = value.trim().replaceAll("\r\n", "\n");
  }
  if (brief.project.length < 10) throw new Error("Add a little detail about what you want created.");
  if (!/^[^\s@]+@[^\s@]+$/u.test(brief.email)) throw new Error("Enter a valid reply email.");
  return brief;
}

export function briefRows(brief) {
  return [
    ["Mission", services.find(item => item.id === brief.service).name],
    ["Project", brief.project],
    ["Intended use", usageNames[brief.usage]],
    ["Size and deliverables", brief.deliverables],
    ["References and permissions", brief.references],
    ["Timing", brief.deadline],
    ["Budget", brief.budget],
    ["Reply email", brief.email]
  ].filter(([, value]) => value);
}
