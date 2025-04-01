import { RouteObject } from "react-router";
import PrivateRoute from "../../shared/routes/PrivateRoute";
import { Role } from "../../shared/constants/roles";
import Home from "./pages/home/Home";
import Login from "../auth/pages/Login";
import Verify from "../auth/pages/Verify";
import Error from "../auth/pages/Error";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProfilePage from "./pages/ProfilePage";
import ViewProject from "./pages/ViewProject";
import Service from "./pages/Service";

export const commonRoutes: RouteObject[] = [
    {
        path: "/",
        element: <Home />
    },

    {
        path: "/login",
        element: <Login />,
    },

    {
        path: "/verify-email/:token",
        element: <Verify />
    },

    {
        path: "/unauthorized",
        element: <Error />,
    },

    {
        path: "/service",
        element: <Service />,
    },

    {
        path: "/about",
        element: <About />,
    },

    {
        path: "/contact",
        element: <Contact />,
    },

    {
        path: "/viewprojects",
        element: <ViewProject />,
    },

    {
        path: "",
        element: <PrivateRoute allowedRoles={
            [
                Role.ADMIN,
                Role.APPROVER,
                Role.FINANCE,
                Role.USER,
            ]
        }
        />,
        children: [
            {
                path: "profile",
                element: <ProfilePage />,
            },
        ],

    },
];