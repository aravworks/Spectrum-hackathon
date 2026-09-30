export function calculatePercentage(part, total) {
  if (!total || total === 0) return 0;

  return (part / total) * 100;
}

export function calculateRecoveryRate(recovered, generated) {
  if (!generated || generated === 0) return 0;

  return (recovered / generated) * 100;
}

export function calculateDiversionRate(diverted, totalWaste) {
  if (!totalWaste || totalWaste === 0) return 0;

  return (diverted / totalWaste) * 100;
}

export function calculateUnknownRate(unknown, total) {
  if (!total || total === 0) return 0;

  return (unknown / total) * 100;
}

export function calculateScenarioDifference(
  baseline,
  scenario
) {
  if (baseline === 0) {
    return 0;
  }

  return ((scenario - baseline) / baseline) * 100;
}

export function calculateMaterialDemand(
  productionQuantity,
  materialPerProduct
) {
  return productionQuantity * materialPerProduct;
}