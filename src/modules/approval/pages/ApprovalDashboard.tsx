import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Layout from "../../../shared/layouts/Layout";
import DashboardPage from "./DashboardPage";
import RequestPage from "../../users/pages/request/RequestPage";
import ApprovalPage from "./ApprovalPage";
import { useLocation } from "react-router-dom";

const ApprovalDashboard = () => {
  const [currentSection, setCurrentSection] = useState<string>("approve");
  const location = useLocation();

  useEffect(() => {
    // Set the current section based on the URL path
    const path = location.pathname;
    if (path.includes("/approval/dashboard")) {
      setCurrentSection("dashboard");
      localStorage.setItem("currentSection", "dashboard");
    } else if (path.includes("/approval/my-requests")) {
      setCurrentSection("my-requests");
      localStorage.setItem("currentSection", "my-requests");
    } else if (path.includes("/approval/claims")) {
      setCurrentSection("approve");
      localStorage.setItem("currentSection", "approve");
    }
  }, [location.pathname]);

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <DashboardPage />;
      case "my-requests":
        return <RequestPage />;
      case "approve":
        return <ApprovalPage />;
      default:
        return <ApprovalPage />;
    }
  };

  return (
    <div>
      <Layout>
        <Box sx={{ padding: 2 }}>{renderContent()}</Box>
      </Layout>
    </div>
  );
};

export default ApprovalDashboard;
