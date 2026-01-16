import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";

import {
  Sidenav,
  DashboardNavbar,
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

        <Outlet />

        <div className="text-blue-gray-600">
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
