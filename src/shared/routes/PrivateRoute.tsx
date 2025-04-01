import { Navigate, Outlet } from "react-router-dom";
import { Role } from "../constants/roles";
import { useEffect, useState } from "react";

interface PrivateRouteProps {
  allowedRoles: Role[];
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoading(false);
    }
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return allowedRoles.includes(user?.role_code as Role) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" />
  );
};

export default PrivateRoute;
