import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import  { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
const API_URL = "https://management-claim-request.vercel.app/api";

interface Claim {
  _id: string;
  claim_name: string;
  claim_status: string;
  claim_start_date: string;
  claim_end_date: string;
  total_work_time: number;
  staff_name: string;
  staff_email: string;
  project_info: {
    project_name: string;
    project_code: string;
  };
  role_in_project: string;
  remark?: string;
}

function ClaimRequestBarChart() {
      const [token, setToken] = useState<string>("");
      const [loading, setLoading] = useState(true);
          const [claims, setClaims] = useState<Claim[]>([]);
        
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
        }
      }, []);
    
      useEffect(() => {
        if (!token) return;
    
        const fetchClaims = async () => {
          try {
            setLoading(true);
            const response = await axios.post(
              `${API_URL}/claims/search`,
              {
                searchCondition: {
                  keyword: "",
                  claim_status: "",
                  claim_start_date: "",
                  claim_end_date: "",
                  is_delete: false,
                },
                pageInfo: {
                  pageNum: 1,
                  pageSize: 1000, // Get more to handle client-side filtering
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
    
            if (response.data.success) {
              setClaims(response.data.data.pageData);
            }
          } catch (error) {
            console.error("Error fetching claims:", error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchClaims();
      }, [token]);
  const claimRequestData = {
    labels: ["Pending", "Approved", "Rejected", "Paid", "Cancelled", "Draft"],
    datasets: [
      {
        label: "Claim Requests",
        data: [
            claims.filter((claim) => claim.claim_status === "Pending Approval").length,
            claims.filter((claim) => claim.claim_status === "Approved").length,
            claims.filter((claim) => claim.claim_status === "Rejected").length,
            claims.filter((claim) => claim.claim_status === "Paid").length,
            claims.filter((claim) => claim.claim_status === "Canceled").length,
            claims.filter((claim) => claim.claim_status === "Draft").length,

        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",    
          "rgba(255, 206, 86, 0.7)",
          "rgba(36, 250, 118, 0.7)",
          "rgba(250, 89, 36, 0.7)",
          "rgba(97, 80, 74, 0.7)",


        ],
      },
    ],
  };
  return (
    <div>
      {loading ? (
                <div>Loading...</div> 
            ) : (
      <div className="bar-chart">
        <p style={{ textAlign: "center", margin: "20px", fontSize: "20px", color: "#418c9f" }}>Claim Request</p>
        <Bar data={claimRequestData} />
      </div>
      )}
    </div>
  );
}

export default ClaimRequestBarChart;
