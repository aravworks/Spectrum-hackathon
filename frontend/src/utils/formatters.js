export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
  });
}

export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${Number(value).toFixed(decimals)}%`;
}

export function formatWeight(value, unit = "kg") {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${formatNumber(value, 2)} ${unit}`;
}

export function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncateText(text, length = 100) {
  if (!text) return "";

  return text.length > length
    ? `${text.substring(0, length)}...`
    : text;
}