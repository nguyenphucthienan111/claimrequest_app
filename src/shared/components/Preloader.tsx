import React from "react";

const Preloader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen fixed inset-0 bg-white z-100">
      <div className="relative flex items-center">
        <div className="relative w-[20px] h-[45px]">
          <div
            className="absolute top-0 left-0 w-[20px] h-[20px] rounded-full"
            style={{
              background: "linear-gradient(to right, #00093c, #2d0b00)",
              animation: "bounce-ball 300ms alternate infinite ease",
              position: "absolute",
            }}
          ></div>
        </div>

        {/* Văn bản */}
        <span className="ml-3 text-[#2d0b00] font-montserrat text-lg font-semibold">
          Loading please wait...
        </span>
      </div>

      <style>
        {`
          @keyframes bounce-ball {
            0% {
              top: 35px;
              height: 6px;
              border-radius: 60px 60px 20px 20px;
              transform: scaleX(2);
            }
            35% {
              height: 20px;
              border-radius: 50%;
              transform: scaleX(1);
            }
            100% {
              top: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Preloader;