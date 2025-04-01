import { Navigate, RouteObject } from "react-router-dom";

import PrivateRoute from "../../shared/routes/PrivateRoute";
import { Role } from "../../shared/constants/roles";

import UserDashboard from "./pages/user-dashboard/UserDashboard";
import RequestPage from "./pages/request/RequestPage";


export const userRoutes: RouteObject[] = [
    {
        path: "/user",
        element: <PrivateRoute allowedRoles={
            [
                Role.USER,
                Role.APPROVER,
                Role.FINANCE,
                Role.ADMIN
            ]
        }
        />,
        children: [
            {
                path: "",
                element: <Navigate to="dashboard" replace />
            },
            {
                path: "dashboard",
                element: <UserDashboard />
            },
            {
                path: "my-requests",
                element: <RequestPage/>
            }
        ],
    },
];