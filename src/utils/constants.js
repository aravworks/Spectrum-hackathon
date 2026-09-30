export const APP_NAME = "ECOVERSE";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const CATEGORIES = [
  "Textile & Fashion",
  "Plastic & Packaging",
  "Electronics & E-waste",
  "Food Waste",
  "Batteries",
  "Cosmetics",
  "Automotive",
  "Construction",
  "Household",
  "Other",
];

export const DATA_CONFIDENCE = {
  VERIFIED: {
    label: "Verified",
    color: "green",
    description: "Supported by verified or external data.",
  },

  COMPANY_REPORTED: {
    label: "Company Reported",
    color: "yellow",
    description: "Reported by the company and not independently verified.",
  },

  MODELLED: {
    label: "Modelled",
    color: "blue",
    description: "Estimated using a model.",
  },

  UNAVAILABLE: {
    label: "Unavailable",
    color: "gray",
    description: "Information is currently unavailable.",
  },
};

export const LIFECYCLE_STAGES = [
  "Raw Material",
  "Manufacturing",
  "Transportation",
  "Distribution",
  "Consumption",
  "Return / Reuse",
  "Repair",
  "Recycling",
  "Final Disposal",
];

export const USER_ROLES = [
  "Consumer",
  "Company",
  "Waste Operator",
  "Researcher",
  "Authority",
  "Admin",
];