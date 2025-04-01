
import { Box } from "@mui/material";
import { East as EastIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const itemData = [
  {
    img: 'https://fpt.com/Images/images/tin-tuc-2021/toa-nha/Toan-canh-toa-nha.jpg',
    title: 'Camera',
    height: '550px',
  },
  {
    img: 'https://funix.edu.vn/wp-content/uploads/2023/09/fsoft.jpg',
    title: 'Burger',
    height: '400px',
  },
  {
    img: 'https://channel.mediacdn.vn/428462621602512896/2023/8/17/photo-2-1692246092193179071629.jpg',
    title: 'Coffee',
    height: '550px',
  },
  {
    img: 'https://static.wixstatic.com/media/84770f_75e268e4225a4dca8ca0bbfc3c5b4042~mv2.jpg/v1/fill/w_515,h_460,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/84770f_75e268e4225a4dca8ca0bbfc3c5b4042~mv2.jpg',
    title: 'Breakfast',
    height: '400px',
  },
];

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-10">
      <Box
        className="flex justify-evenly items-end gap-2 overflow-x-auto whitespace-nowrap"
      >
        {itemData.map((item) => (
          <Box
            key={item.img}
            component="img"
            src={item.img}
            alt={item.title}
            sx={{ width: 450, height: item.height, objectFit: "cover" }}
            className="animate-fadeIn"
          />
        ))}
      </Box>

      <div className="flex items-center h-[680px] mt-24">
        <div className="flex-1 flex flex-col justify-center items-end max-w-[50%] bg-[#BEDBFF] h-full pr-12">
          <h2 className="text-[60px] font-bold relative mb-8 flex items-center">
            ABOUT US
            <EastIcon
              className="ml-5 text-[50px] cursor-pointer hover:bg-gray-200 hover:rounded-full hover:text-[#D1D7F1]"
              onClick={() => navigate("/about")}
            />
            <span className="absolute bottom-0 left-0 w-[120px] h-2 bg-[#EDCD1F]"></span>
          </h2>
          <p className="font-light w-[50%]">
            Our platform is designed to streamline payroll processing and attendance management for FPT employees, ensuring accuracy, efficiency, and transparency. We simplify the entire workflow, from tracking working hours to approving and processing payments, reducing administrative burdens and minimizing errors.
            <br />
            With an intuitive and user-friendly interface, employees can easily submit attendance records, request adjustments, and track payment statuses in real time. Meanwhile, managers can efficiently review and approve requests, ensuring that payroll calculations are accurate and compliant with company policies. We prioritize automation and efficiency, integrating smart features that help businesses optimize timekeeping, salary calculations, and reporting.
          </p>
        </div>
        <Box
          className="flex-1 h-full bg-cover bg-center bg-fixed"
          sx={{
            backgroundImage:
              "url('https://career.fpt-software.com/wp-content/themes/jobcareer/fpt_landing_page/landing-fpt-affiliate-2024/assets/img/slider-img.jpg')",
          }}
        />
      </div>
    </div>
  );
};

export default AboutUs;