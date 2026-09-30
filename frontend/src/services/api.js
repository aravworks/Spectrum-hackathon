const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://spectrum-hackathon.onrender.com/api/v1";

async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }
  );

  if (!response.ok) {
    throw new Error(
      `API Error: ${response.status}`
    );
  }

  return response.json();
}

export const api = {
  getProducts: () =>
    request("/products"),

  getProduct: (id) =>
    request(`/products/${id}`),

  getLifecycle: (id) =>
    request(`/products/${id}/lifecycle`),

  getEnvironmentalImpact: (id) =>
    request(`/products/${id}/impact`),

  getDashboard: () =>
    request("/dashboard"),

  getCompanies: () =>
    request("/companies"),

  getWasteManifests: () =>
    request("/waste-manifests"),
};

export default api;