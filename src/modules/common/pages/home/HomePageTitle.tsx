import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";


const HomepageTitle: React.FC = () => {
  const navigate = useNavigate();
  const statsData = [
    { value: "86", label: "Branches & Representative offices" },
    { value: "1100+", label: "Global Clients" },
    { value: "33k+", label: "Employees" },
    { value: "30+", label: "Countries & Territories" },
    { value: "Top 30", label: "Largest IT companies in Japan" },
    { value: "11+", label: "International Awards" },
    { value: "24+", label: "Years of Innovation" },
  ];

  return (
    <>
      <div className="flex w-full h-fit">
        <div className="w-1/2 flex flex-col justify-center px-5 md:px-30">
          <h2 className="text-5xl font-bold">
            Financial Services You Can <span className="text-[#BEDBFF]">Trust.</span>
          </h2>
          <div className="text-lg my-6">
            <p>Delivering trusted accounting services to businesses, focusing on</p>
            <p>reliability and professional financial support.</p>
          </div>
          <Button
            variant="contained"
            fullWidth
            disableElevation
            sx={{
              backgroundColor: "black",
              color: "#eee",
              fontWeight: "bold",
              padding: "6px 10px",
              border: "1px solid black",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              width: "150px",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "transparent",
                border: "1px solid black",
                color: "black",
                fontWeight: "normal",
              },
            }}
            onClick={() => navigate("/contact")}
          >
            Contact Us
          </Button>
        </div>
        <div className="w-1/2">
          <div id="homepage-effect">
            <img
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt=""
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
      <div className="w-[99vw] overflow-hidden mb-60 mx-auto border-y border-gray-300 bg-white py-4 select-none">
        <div className="flex gap-16 animate-scroll whitespace-nowrap hover:[animation-play-state:paused]">
          {[...statsData, ...statsData, ...statsData].map((stat, index) => (
            <div key={index} className="flex flex-col items-center px-16 min-w-[200px]">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className="text-lg text-gray-600">{stat.label}</span>
            </div>
          ))}
        </div>

        <style>
          {`
            @keyframes scroll {
              from { transform: translateX(0); }
              to { transform: translateX(-33.33%); }
            }
            .animate-scroll {
              width: max-content;
              animation: scroll 20s linear infinite;
            }
          `}
        </style>
      </div>

    </>

  );
};

export default HomepageTitle;