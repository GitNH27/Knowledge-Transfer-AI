import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "@/layouts";
import routes from "@/routes";

// pages
import Onboarding from "@/pages/page/onboarding";

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />

      <Route element={<Dashboard />}>
        {routes
          .find((r) => r.layout === "dashboard")
          .pages.map(({ path, element }, key) => (
            <Route key={key} path={path} element={element} />
          ))}
      </Route>

      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  );
}

export default App;
