import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";

import {
  Sidenav,
  DashboardNavbar,
  Footer,
} from "@/widgets/layout";

import routes from "@/routes";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
} from "@/context";

import { useAppConfig } from "@/context/appConfig";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;

  const { industry, role } = useAppConfig();
  const navigate = useNavigate();

  /**
   * -------------------------
   * ONBOARDING GATE
   * -------------------------
   */
  useEffect(() => {
    if (!industry || !role) {
      navigate("/onboarding");
    }
  }, [industry, role, navigate]);

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark"
            ? "/img/logo-ct.png"
            : "/img/logo-ct-dark.png"
        }
      />

      <div className="p-4 xl:ml-80">
        <DashboardNavbar />

        {/* Main Page Content */}
        <Outlet />

        {/* Floating Config Button */}
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>

        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
