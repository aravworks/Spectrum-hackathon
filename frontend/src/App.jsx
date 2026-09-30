import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/LandingPage";
import WasteMarketplacePage from "./pages/WasteMarketplacePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ComplaintTrackingPage from "./pages/ComplaintTrackingPage";
import DashboardPage from "./pages/DashboardPage";
import ProductPassportPage from "./pages/ProductPassportPage";
import ProductTracePage from "./pages/ProductTracePage";
import EnvironmentalImpactPage from "./pages/EnvironmentalImpactPage";
import ClimateLabPage from "./pages/ClimateLabPage";
import ConsumerPage from "./pages/ConsumerPage";
import WasteManifestPage from "./pages/WasteManifestPage";
import WasteAwarenessPage from "./pages/WasteAwarenessPage";
import WasteReportsPage from "./pages/WasteReportsPage";
import ReportWasteIssuePage from "./pages/ReportWasteIssuePage";
import PickupRequestPage from "./pages/PickupRequestPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC PAGES
        ========================= */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* =========================
            APPLICATION
        ========================= */}

        <Route element={<MainLayout />}>

          <Route
  path="/complaint-tracking"
  element={<ComplaintTrackingPage />}
/>
<Route
  path="/waste-marketplace"
  element={<WasteMarketplacePage />}
/>
<Route
  path="/waste-awareness"
  element={<WasteAwarenessPage />}
/>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/product/:id"
            element={<ProductPassportPage />}
          />

          <Route
            path="/product/:id/trace"
            element={<ProductTracePage />}
          />

          <Route
            path="/environmental-impact"
            element={<EnvironmentalImpactPage />}
          />

          <Route
            path="/climate-lab"
            element={<ClimateLabPage />}
          />

          <Route
            path="/consumer"
            element={<ConsumerPage />}
          />

          <Route
            path="/waste-manifest"
            element={<WasteManifestPage />}
          />

          <Route
            path="/waste-reports"
            element={<WasteReportsPage />}
          />

          <Route
            path="/report-waste"
            element={<ReportWasteIssuePage />}
          />

          <Route
            path="/pickup-request"
            element={<PickupRequestPage />}
          />

        </Route>

        {/* =========================
            UNKNOWN URL
        ========================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;