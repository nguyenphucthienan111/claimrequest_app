import { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

interface DashboardStats {
  pending: number;
  approved: number;
  rejected: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");

        // Configure axios
        const axiosInstance = axios.create({
          baseURL: "https://management-claim-request.vercel.app",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const pendingResponse = await axiosInstance.post(
          "/api/claims/approval-search",
          {
            searchCondition: {
              keyword: "",
              claim_status: "Pending Approval",
              claim_start_date: "",
              claim_end_date: "",
              is_delete: false,
            },
            pageInfo: {
              pageNum: 1,
              pageSize: 99999,
            },
          }
        );

        const approvedResponse = await axiosInstance.post(
          "/api/claims/approval-search",
          {
            searchCondition: {
              keyword: "",
              claim_status: "Approved",
              claim_start_date: "",
              claim_end_date: "",
              is_delete: false,
            },
            pageInfo: {
              pageNum: 1,
              pageSize: 99999,
            },
          }
        );

        const rejectedResponse = await axiosInstance.post(
          "/api/claims/approval-search",
          {
            searchCondition: {
              keyword: "",
              claim_status: "Rejected",
              claim_start_date: "",
              claim_end_date: "",
              is_delete: false,
            },
            pageInfo: {
              pageNum: 1,
              pageSize: 99999,
            },
          }
        );

        console.log("Pending Response:", pendingResponse.data);
        console.log("Approved Response:", approvedResponse.data);
        console.log("Rejected Response:", rejectedResponse.data);

        setStats({
          pending: pendingResponse.data.data.pageInfo.totalItems,
          approved: approvedResponse.data.data.pageInfo.totalItems,
          rejected: rejectedResponse.data.data.pageInfo.totalItems,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const pieData = [
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
    { name: "Pending", value: stats.pending },
  ];

  const timelineData = [
    {
      month: "Current",
      pending: stats.pending,
      approved: stats.approved,
      rejected: stats.rejected,
    },
  ];

  const COLORS = ["#0088FE", "#FF8042", "#FFBB28"];

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 600,
          color: "#1a237e",
        }}
      >
        Dashboard Overview
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                sx={{ fontSize: "1.1rem" }}
              >
                Pending Requests
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  color: "#FFBB28",
                }}
              >
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                sx={{ fontSize: "1.1rem" }}
              >
                Approved Requests
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  color: "#0088FE",
                }}
              >
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                sx={{ fontSize: "1.1rem" }}
              >
                Rejected Requests
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  color: "#FF8042",
                }}
              >
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: "#1a237e",
                  mb: 3,
                }}
              >
                Requests Timeline
              </Typography>
              <Box sx={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approved" name="Approved" fill="#0088FE" />
                    <Bar dataKey="rejected" name="Rejected" fill="#FF8042" />
                    <Bar dataKey="pending" name="Pending" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: "#1a237e",
                  mb: 3,
                }}
              >
                Request Distribution
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 400,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
