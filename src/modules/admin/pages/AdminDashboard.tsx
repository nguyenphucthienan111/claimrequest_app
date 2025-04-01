import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "./AdminDashboard.css";
import { AccountCircleOutlined, Folder } from "@mui/icons-material";
import { Grid } from "@mui/material";

import { useNavigate } from "react-router-dom";
import Layout from "../../../shared/layouts/Layout";
import { useEffect, useState } from "react";
import { User } from "../types/user";
import { searchUsers } from "../services/userService";
import { searchProject } from "../services/projectService";
import ClaimRequestBarChart from "../components/ClaimRequestBarChart";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function AdminDashboard() {
  const navigate = useNavigate();
  const [pageNum] = useState(1); //  Track current page
  const [pageSize] = useState(1000); //  Items per page
  const [totalPages, setTotalPages] = useState(1); // Total pages from API
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [projects, setProjects] = useState([]);
  const [projectCount, setProjectCount] = useState(0);

  const fetchUsers = async () => {
    // Fetch total user count
    setLoading(true);
    try {
      const response = await searchUsers({}, { pageNum, pageSize });
      setCount(response.pageInfo.totalItems);
      if (response?.pageData && response?.pageInfo) {
        setUsers(response.pageData); //  Correctly setting users
        setTotalPages(response.pageInfo.totalPages || 1); //  Fix pagination
        console.log(totalPages);
      } else {
        console.error("Invalid API response structure:", response);
        setUsers([]); // 🛠 Prevent crashes
      }
    } catch (error) {
      console.error("Failed to fetch user count", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await searchProject("", pageNum);
      setProjectCount(response.data.pageInfo.totalItems);
      if (response?.data.pageData && response?.data.pageInfo) {
        setProjectCount(response.data.pageInfo.totalItems);
        setTotalPages(response.data.pageInfo.totalPages || 1);
      } else {
        console.error("Invalid API response structure:", response);
        setProjects([]); // 🛠 Prevent crashes
        console.log(projects)
      }
    } catch (error) {
      console.error("Failed to fetch project count", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProjects(); // Call fetchProjects to get project count
  }, [pageNum]);

  const data = {
    labels: ["Admin", "Approval", "Finance", "User"],
    datasets: [
      {
        label: "# of Votes",
        data: [
          users.filter((user) => user.role_code === "A001").length,
          users.filter((user) => user.role_code === "A003").length,
          users.filter((user) => user.role_code === "A002").length,
          users.filter((user) => user.role_code === "A004").length,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(36, 250, 118, 0.2)",
        ],
      },
    ],
  };

  return (
    <div>
  
      <Layout>
        <div className="admin-dashboard-container">
          <div className="content-dashboard">
            <h2>Welcome!</h2>
            <Grid container spacing={10} className="items-card">
              <Grid item xs={2} onClick={() => navigate("/admin/managestaff")}>
                <div className="user-card">
                  <div className="user-card-left">
                    <p>Users</p>
                    <p>{count}</p>
                  </div>
                  <div className="user-card-right">
                    <AccountCircleOutlined style={{ fontSize: "50px" }} />
                  </div>
                </div>
              </Grid>
              <Grid item xs={2} onClick={() => navigate("/admin/manageproject")}>
                <div className="project-card">
                  <div className="project-card-left">
                    <p>Project</p>
                    <p>{projectCount}</p>
                  </div>
                  <div className="user-card-right">
                    <Folder style={{ fontSize: "50px" }} />
                  </div>
                </div>
              </Grid>
            
            </Grid>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={6}>
              {loading ? (
                <div>Loading...</div> 
            ) : (
                <div className="chart-container">
                  <p style={{ textAlign: "center", margin: "20px", fontSize: "20px", color: "#418c9f" }}>Users</p>
                  <Doughnut data={data} />
                </div>
                  )}
              </Grid>
              <Grid item xs={6}>
                <div className="bar-chart">
                  <ClaimRequestBarChart />
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </Layout>
          
    </div>
            
  );
}

export default AdminDashboard;
