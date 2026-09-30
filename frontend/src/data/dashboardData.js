export const dashboardStats = [
  {
    label: "Products Traced",
    value: "12,480",
    unit: "",
    change: "+8.4%",
    description: "Products with lifecycle records",
  },
  {
    label: "Material Flow",
    value: "8.7",
    unit: "M kg",
    change: "+5.2%",
    description: "Tracked material movement",
  },
  {
    label: "Waste Recovered",
    value: "2.1",
    unit: "M kg",
    change: "+12.7%",
    description: "Reuse and recycling pathways",
  },
  {
    label: "Unknown EOL",
    value: "18.6",
    unit: "%",
    change: "-3.1%",
    description: "Products without known final outcome",
  },
];

export const wasteFlowData = [
  {
    name: "Textile",
    generated: 4200,
    recovered: 2500,
    unknown: 1100,
  },
  {
    name: "Plastic",
    generated: 6100,
    recovered: 3800,
    unknown: 900,
  },
  {
    name: "E-waste",
    generated: 2800,
    recovered: 1900,
    unknown: 500,
  },
  {
    name: "Food",
    generated: 5200,
    recovered: 3200,
    unknown: 1200,
  },
  {
    name: "Battery",
    generated: 1700,
    recovered: 1200,
    unknown: 280,
  },
];

export const lifecycleFlow = [
  {
    stage: "Raw Material",
    value: 100,
  },
  {
    stage: "Manufacturing",
    value: 94,
  },
  {
    stage: "Distribution",
    value: 91,
  },
  {
    stage: "Consumption",
    value: 86,
  },
  {
    stage: "Return / Reuse",
    value: 58,
  },
  {
    stage: "Recycling",
    value: 42,
  },
  {
    stage: "Final Outcome",
    value: 31,
  },
];

export const materialFlow = [
  {
    material: "Cotton",
    quantity: "2.8M kg",
    recycled: "24%",
    confidence: "company",
  },
  {
    material: "PET Plastic",
    quantity: "1.9M kg",
    recycled: "48%",
    confidence: "verified",
  },
  {
    material: "Aluminium",
    quantity: "860K kg",
    recycled: "71%",
    confidence: "verified",
  },
  {
    material: "Lithium",
    quantity: "190K kg",
    recycled: "34%",
    confidence: "modelled",
  },
];

export const gapData = [
  {
    category: "Textile",
    gaps: 8420,
  },
  {
    category: "Plastic",
    gaps: 6410,
  },
  {
    category: "Electronics",
    gaps: 3980,
  },
  {
    category: "Food",
    gaps: 3250,
  },
];