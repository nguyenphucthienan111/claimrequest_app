import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Box, Typography, TextField, Button, InputAdornment, CircularProgress } from "@mui/material";
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Preloader from "../../../shared/components/Preloader";
import { resendToken, verifyToken } from "../services/authService";
import toast from "react-hot-toast";

const VerifyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>(); // Lấy token từ URL
  console.log(token);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isProcess, setIsProcess] = useState(false);

  useEffect(() => {
    // Nếu không có token, hiển thị modal
    if (!token) {
      setLoading(false);
      setShowModal(true);
      return;
    }

    const verifyUserToken = async () => {
      try {
        await verifyToken(token);
        setIsRedirecting(true);
        toast("Email verified successfully.", {
          icon: "🔥",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error: any) {
        toast(error.toString(), {
          icon: "❌",
        });
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    const delay = Math.random() * (2000 - 1000) + 1000;
    setTimeout(verifyUserToken, delay);
  }, [token, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const handleRequestNewToken = async () => {
    if (isProcess) return;
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      return;
    }
    setEmailError("");
    setIsProcess(true);

    try {
      await resendToken(email);
      toast("Please check your email to receive new tokens.", {
        icon: "🔥",
      });
    } catch (error: any) {
      toast(error.toString(), {
        icon: "❌",
      });
    } finally {
      setIsProcess(false);
    }
  };

  return (
    <>
      {loading && <Preloader />}

      <Modal open={showModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#2C2638",
            color: "#fff",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Authentication failed
          </Typography>
          <Typography variant="body1" gutterBottom>
            Please enter email to receive new token:
          </Typography>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
            sx={{
              mt: 2,
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 30px #3C364C inset",
                WebkitTextFillColor: "#fff",
              },
              "& .MuiInputBase-input": {
                color: "#fff",
                fontSize: "17px",
                padding: "7px",
              },
              // "& .MuiInputBase-input:focus": {
              //   color: "#fff",
              // },
              "& .MuiInput-underline:before": {
                borderBottom: "1px solid #7464a5",
              },
              "& .MuiInput-underline:hover:before": {
                borderBottom: "1px solid #fff !important",
              },
              "& .MuiInput-underline:after": {
                borderBottom: "2px solid #fff",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <EmailOutlinedIcon sx={{
                    mr: 1,
                    color: "#7A748A"
                  }} />
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            fullWidth
            disableElevation
            sx={{
              mt: 2,
              backgroundColor: "#6D54B3",
              color: "#eee",
              fontWeight: "bold",
              padding: "6px 10px",
              border: "1px solid #6D54B3",
              borderRadius: "0px",
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
            onClick={handleRequestNewToken}
          >
            {isProcess ? <CircularProgress size={28} thickness={5} /> : "Resend token"}
          </Button>
        </Box>
      </Modal>

      {
        isRedirecting ? (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-opacity-70 backdrop-blur-sm z-50">
            <div className="text-lg font-medium text-gray-700 animate-pulse mb-4">
              Redirecting...
            </div>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce"></div>
              <div
                className="w-4 h-4 rounded-full bg-gray-700 animate-bounce"
                style={{ animationDelay: "-0.2s" }}
              ></div>
              <div
                className="w-4 h-4 rounded-full bg-gray-700 animate-bounce"
                style={{ animationDelay: "-0.4s" }}
              ></div>
            </div>
          </div>

        ) : null}
    </>
  );
};

export default VerifyPage;