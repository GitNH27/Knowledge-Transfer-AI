import {
  CloudArrowUpIcon,
  BookOpenIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";
import { Upload, Lectures } from "@/pages/dashboard";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <CloudArrowUpIcon {...icon} />,
        name: "Upload Documents",
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
        element: <Lectures />
      },
    ],
  },
];

export default routes;
