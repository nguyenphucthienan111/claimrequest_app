import React, { useEffect, useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { TextField, Checkbox, FormControlLabel, Button, InputAdornment, IconButton, CircularProgress, Typography } from "@mui/material";
import { forgotPassword, getUserInfo, login } from "../services/authService";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface LoginFormInputs {
  email: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingForgot, setIsLoadingForgot] = useState(false);
  const [index, setIndex] = useState(0);
  const [animation, setAnimation] = useState("animate__fadeIn");
  const [showPassword, setShowPassword] = useState(false);
  const [toggleForm, setToggleForm] = useState(false);

  const slogans = [
    ["Optimize Workflow,", "Elevate Management"],
    ["Streamline Claims,", "Enhance Efficiency"],
  ]

  const images = [
    "https://images.unsplash.com/photo-1726066012825-b1ab9ba6e158?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1554232456-8727aae0cfa4?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1693533846949-5df11d41642e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimation("animate__animated animate__fadeOut"); // FadeOut trước

      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex === 0 ? 1 : 0)); // Đổi đoạn văn
        setAnimation("animate__animated animate__fadeIn"); // FadeIn đoạn mới
      }, 1000); // Đợi 1s để đổi nội dung sau khi fadeOut xong
    }, 4000); // Cứ sau 4s lặp lại
    return () => clearInterval(interval); // Xóa interval khi component unmount
  }, []);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleForgotPasswordClick = () => {
    setIsLoadingForgot(true);
    setTimeout(() => {
      setToggleForm(true);
      setIsLoadingForgot(false);
    }, 1000);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmitLogin = async (data: LoginFormInputs) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      const user = await getUserInfo();
      switch (user.data?.role_code) {
        case "A001":
          navigate("/admin");
          break;
        case "A002":
          navigate("/finance");
          break;
        case "A003":
          navigate("/approval");
          break;
        case "A004":
          navigate("/user");
          break;
        default:
          navigate("/");
      }
      toast("Login successfully.", {
        icon: "✅",
      });
    } catch (error: any) {
      toast(error.toString(), {
        icon: "❌",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitForgetPassword = async (data: LoginFormInputs) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      toast.success("Please check your email to get a new password!", {
        icon: "🔥",
      });
    } catch (error: any) {
      toast(error.toString(), {
        icon: "❌",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {
          isLoadingForgot ? (
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-70 backdrop-blur-sm z-50">
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce"></div>
                <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: "-0.3s" }}></div>
                <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: "-0.5s" }}></div>
              </div>
            </div>
          ) : null}
        {
          !toggleForm ? (
            <div className="login-left">
              <h1 className="login-title">Sign in to your account</h1>
              <div className="login-verify">
                Haven't verify your email?
                <span><a href="https://mail.google.com/mail/u/0/#inbox">Verify account</a></span>
              </div>
              <form className="login-form" onSubmit={handleSubmit(onSubmitLogin)}>
                <TextField
                  label="Email address"
                  type="email"
                  fullWidth
                  margin="normal"
                  sx={{
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 30px #3C364C inset",
                      WebkitTextFillColor: "#fff",
                    }
                  }}
                  {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" } })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  sx={{
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 30px #3C364C inset",
                      WebkitTextFillColor: "#fff",
                    }
                  }}
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          edge="end"
                          sx={{ color: "#7A748A" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <div className="login-options">
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register("remember")}
                        color="primary"
                        className="login-checkbox"
                      />
                    }
                    label="Remember me"
                    className="login-checkbox-wrapper"
                  />
                  <div className="forgot-password" onClick={handleForgotPasswordClick}>
                    Forgot password?
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disableElevation
                  sx={{
                    backgroundColor: "#6D54B3",
                    color: "#eee",
                    fontWeight: "bold",
                    padding: "6px 10px",
                    border: "1px solid #6D54B3",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "transparent",
                      border: "1px solid #6D54B3",
                      color: "#6D54B3",
                      fontWeight: "normal",
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={28} thickness={5}/> : "Sign in"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="forgot-password-container">
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  color: "#fff",
                  marginBottom: "10px",
                  paddingRight: "25%",
                }}>
                Forget password?
              </Typography>
              <Typography sx={{
                color: "#7D7988",
                paddingRight: "20%",
                marginBottom: "40px",
              }}>
                No worries, we'll send you new password.
              </Typography>
              <form onSubmit={handleSubmit(onSubmitForgetPassword)} className="forgot-password-form">
                <TextField
                  placeholder="Enter your email"
                  variant="standard"
                  fullWidth
                  {...register("email", {
                    required: "Please enter email again",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Invalid email format",
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{
                    mb: 2,
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 30px #3C364C inset",
                      WebkitTextFillColor: "#fff",
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: "#6D54B3",
                    color: "#eee",
                    padding: "6px 10px",
                    border: "1px solid #6D54B3",
                    borderRadius: "0px",
                    marginTop: "15px",
                    cursor: "pointer",
                    textTransform: "none",
                    fontSize: "16px",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "transparent",
                      border: "1px solid #6D54B3",
                      color: "#6D54B3",
                      fontWeight: "normal",
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} /> : "Send request"}
                </Button>
              </form>
              <Button
                startIcon={<ArrowBackIcon />}
                sx={{
                  color: "#6a6774",
                  textTransform: "none",
                  marginTop: "20px",
                  "&:hover": {
                    backgroundColor: "#6d54b34b",
                    color: "#fff",
                  },
                }}
                onClick={() => setToggleForm(false)}
              >
                Back to log in
              </Button>
            </div>
          )
        }
        <div className="login-right">
          <Link to="/" className="login-home-link">
            <ArrowBackIcon sx={{ marginRight: "6px" }} />
            Back to website
          </Link>
          <div className={`login-slogan ${animation}`}>
            <p>{slogans[index][0]}</p>
            <p>{slogans[index][1]}</p>
          </div>
          <Swiper
            loop
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            modules={[Navigation, Autoplay, Pagination]}
            className="login-carousel"
          >
            {images.map((src, index) => (
              <SwiperSlide key={index}>
                <img src={src} alt={`Slide ${index}`} style={{ width: "100%" }} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Login;