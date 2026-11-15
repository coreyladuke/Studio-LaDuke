export const services = [
  { id: "formline", name: "Custom formline design", description: "Discuss original artwork or a logo, shaped and reviewed by Corey." },
  { id: "other", name: "Ask about another project", description: "Tell Corey what you have in mind so he can assess the fit." }
];

const usageNames = { personal: "Personal use", commercial: "Business or commercial use", unsure: "Still deciding" };
const materialNames = {
  digital: "Digital artwork",
  cardstock: "Artwork on cardstock",
  canvas: "Artwork on canvas",
  glass: "Artwork on glass",
  unsure: "Help me choose"
};
const budgetNames = {
  "example-50": "$50 example — focused starting point",
  "example-150": "$150 example — developed custom design",
  "example-250": "$250 example — detailed custom design",
  custom: "Another budget or not sure yet"
};
const portfolioNames = {
  yes: "Yes, after delivery",
  later: "Ask me again before showing it",
  no: "Keep this project private"
};
const limits = {
  project: 2000,
  size: 200,
  format: 200,
  references: 1000,
  deadline: 100,
  budget: 100,
  email: 254
};

export function validateBrief(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Enter a project brief.");
  const service = services.find(item => item.id === input.service);
  if (!service) throw new Error("Choose a mission.");
  if (!Object.hasOwn(usageNames, input.usage)) throw new Error("Choose how you’ll use the artwork.");
  if (!Object.hasOwn(materialNames, input.material)) throw new Error("Choose a digital or physical format.");
  if (!Object.hasOwn(budgetNames, input.budgetExample)) throw new Error("Choose the closest budget example.");
  if (!Object.hasOwn(portfolioNames, input.portfolioPermission)) throw new Error("Choose a portfolio preference.");
  const brief = {
    service: service.id,
    usage: input.usage,
    material: input.material,
    budgetExample: input.budgetExample,
    portfolioPermission: input.portfolioPermission
  };
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
    ["Digital or physical", materialNames[brief.material]],
    ["Size", brief.size],
    ["File format or finish", brief.format],
    ["References and permissions", brief.references],
    ["Timing", brief.deadline],
    ["Closest budget example", budgetNames[brief.budgetExample]],
    ["Budget note", brief.budget],
    ["Portfolio preference", portfolioNames[brief.portfolioPermission]],
    ["Reply email", brief.email]
  ].filter(([, value]) => value);
}

export { usageNames, materialNames, budgetNames, portfolioNames };
