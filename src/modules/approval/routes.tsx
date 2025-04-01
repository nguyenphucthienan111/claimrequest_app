import { Navigate, RouteObject } from "react-router-dom";
import { Role } from "../../shared/constants/roles";
import PrivateRoute from "../../shared/routes/PrivateRoute";
import ApprovalDashboard from "./pages/ApprovalDashboard";
import RequestPage from "../users/pages/request/RequestPage";

export const approvalRoutes: RouteObject[] = [
  {
    path: "/approval",
    element: <PrivateRoute allowedRoles={[Role.APPROVER]} />,
    children: [
      {
        path: "dashboard",
        element: <ApprovalDashboard />,
      },
      {
        path: "claims",
        element: <ApprovalDashboard />,
      },
      {
        path: "my-requests",
        element: <RequestPage />,
      },
      {
        path: "",
        element: <Navigate to="/approval/claims" replace />,
      },
    ],
  },
];
