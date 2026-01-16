import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "@/layouts";
import { Onboarding } from "@/pages/page/onboarding";
import routes from "@/routes";
import { useAppConfig } from "@/context/appConfig";

function App() {
  const { hasOnboarded } = useAppConfig();

  return (
    <Routes>
      {!hasOnboarded && <Route path="*" element={<Onboarding />} />}
      
      {hasOnboarded && (
        <Route element={<Dashboard />}>
          {routes.find((r) => r.layout === "dashboard").pages.map(({ path, element }, key) => (
            <Route key={key} path={path} element={element} />
          ))}
        </Route>
      )}

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to={hasOnboarded ? "/upload" : "/"} />} />
    </Routes>
  );
}

export default App;
