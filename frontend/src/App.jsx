import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import DashboardPage from "./pages/DashboardPage";
import ConsumerPage from "./pages/ConsumerPage";

import ProductPassportPage from "./pages/ProductPassportPage";
import ProductTracePage from "./pages/ProductTracePage";

import EnvironmentalImpactPage from "./pages/EnvironmentalImpactPage";
import ClimateLabPage from "./pages/ClimateLabPage";
import CarbonMethanePage from "./pages/CarbonMethanePage";
import SatelliteGISPage from "./pages/SatelliteGISPage";

import ResearchDataLabPage from "./pages/ResearchDataLabPage";

import WasteManifestPage from "./pages/WasteManifestPage";
import WasteReportsPage from "./pages/WasteReportsPage";
import ReportWasteIssuePage from "./pages/ReportWasteIssuePage";
import PickupRequestPage from "./pages/PickupRequestPage";
import ComplaintTrackingPage from "./pages/ComplaintTrackingPage";
import WasteAwarenessPage from "./pages/WasteAwarenessPage";
import WasteMarketplacePage from "./pages/WasteMarketplacePage";

import RouteOptimizationPage from "./pages/RouteOptimizationPage";
import TreatmentsSimulationPage from "./pages/TreatmentsSimulationPage";

import RewardsPage from "./pages/RewardsPage";
import AIChatbotPage from "./pages/AIChatbotPage";



function ProtectedRoute({ children }) {
  const token = localStorage.getItem("ecoverseToken");
  const user = localStorage.getItem("ecoverseUser");
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {

  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main Application */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          {/* Consumer */}
          <Route
            path="/consumer"
            element={<ConsumerPage />}
          />

          {/* Product Intelligence */}
          <Route
            path="/product/:id"
            element={<ProductPassportPage />}
          />

          <Route
            path="/product/:id/trace"
            element={<ProductTracePage />}
          />

          {/* Environmental Intelligence */}
          <Route
            path="/environmental-impact"
            element={<EnvironmentalImpactPage />}
          />

          <Route
            path="/climate-lab"
            element={<ClimateLabPage />}
          />

          <Route
            path="/carbon-methane"
            element={<CarbonMethanePage />}
          />

          <Route
            path="/satellite-gis"
            element={<SatelliteGISPage />}
          />

          {/* Research */}
          <Route
            path="/research-data-lab"
            element={<ResearchDataLabPage />}
          />

          {/* Waste Intelligence */}
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

          <Route
            path="/complaint-tracking"
            element={<ComplaintTrackingPage />}
          />

          <Route
            path="/waste-awareness"
            element={<WasteAwarenessPage />}
          />

          <Route
            path="/waste-marketplace"
            element={<WasteMarketplacePage />}
          />

          {/* Operations */}
          <Route
            path="/route-optimization"
            element={<RouteOptimizationPage />}
          />

          <Route
            path="/treatment-simulation"
            element={<TreatmentsSimulationPage />}
          />

          {/* Rewards */}
          <Route
            path="/rewards"
            element={<RewardsPage />}
          />

          {/* AI Assistant */}
          <Route
            path="/ai-chatbot"
            element={<AIChatbotPage />}
          />

        </Route>

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;