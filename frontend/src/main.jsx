import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// --- Global Fetch Interceptor for JWT Expiry ---
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  
  // If the token is expired/invalid (401) and we aren't actively trying to log in
  if (response.status === 401 && !args[0].toString().includes('/auth/login')) {
    console.warn("JWT expired or invalid. Auto-redirecting to login.");
    localStorage.removeItem("ecoverseToken");
    localStorage.removeItem("ecoverseUser");
    window.location.hash = "#/login";
  }
  
  return response;
};
// -----------------------------------------------


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);