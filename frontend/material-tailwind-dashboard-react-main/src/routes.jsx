import {
  ArrowUpTrayIcon,
  UserCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile } from "@/pages/dashboard";
import { SignIn, Onboarding } from "@/pages/page";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <ArrowUpTrayIcon {...icon} />,
        name: "Upload Documents",
        path: "/upload",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
  {
    layout: "page",
    pages: [
      {
        icon: null,
        name: "Onboarding",
        path: "/onboarding",
        element: <Onboarding />,
      },
    ],
  },
];

export default routes;
