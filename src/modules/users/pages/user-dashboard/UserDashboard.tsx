import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ClaimRequestData from "./ClaimRequestData";
import PieChartComponent from "./PieChartComponent";
import Layout from "../../../../shared/layouts/Layout"; 
import { Grid } from "@mui/material";
import { Folder } from "@mui/icons-material";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function UserDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <Layout>
        
        <div className="dashboard-container">
          {/* Swiper Slider */}
          <div className="items-cards">
        <div className="request-card">
          <Grid item xs={2} onClick={() => navigate("/user/my-requests")}>
            <div className="requests-cards">
              <div className="requests-card-left">
                <p>My claims</p>
                {/* <p>{count}</p> */}
              </div>
              <div className="requests-card-right">
                <Folder style={{ fontSize: "50px" }} />
              </div>
            </div>
          </Grid>
        </div>
        </div>
          {/* PieChartComponent */}
          <div className="chart-wrapper">
            <div className="chart-container">
              <PieChartComponent />
            </div>

            {/* ClaimRequestData */}
            <div className="bar-chart">
              <ClaimRequestData />
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}
