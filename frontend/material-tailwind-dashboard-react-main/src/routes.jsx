import {
  CloudArrowUpIcon,
  BookOpenIcon,
  BoltIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { Upload, Lectures, Learn, Settings } from "@/pages/dashboard";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <CloudArrowUpIcon {...icon} />,
        name: "Upload Document",
        path: "/upload",
        element: <Upload />,
      },
      {
        icon: <BookOpenIcon {...icon} />,
        name: "Lectures",
        path: "/lectures",
        element: <Lectures />,
      },
      {
        icon: <BoltIcon {...icon} />,
        name: "Learn",
        path: "/learn",
        element: <Learn />
      },
      {
        icon: <Cog6ToothIcon {...icon} />,
        name: "Settings",
        path: "/settings",
        element: <Settings />
      },
    ],
  },
];

export default routes;
