import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import React, { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Divider, Menu, MenuItem } from "@mui/material";
import { logout } from "../../../modules/auth/services/authService";
import ConfirmModal from "../ConfirmModal";

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header = ({ toggleSidebar = () => { } }: HeaderProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem("token") || null;
  const [navbar, setNavbar] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogOut = () => {
    logout();
    setTimeout(() => {
      navigate("/login");
    }, 100);
  };

  useEffect(() => {
    const changeBackground = () => {
      if (window.scrollY >= 50) {
        setNavbar(true);
      } else {
        setNavbar(false);
      }
    };
  
    window.addEventListener('scroll', changeBackground);
    return () => {
      window.removeEventListener('scroll', changeBackground);
    };
  }, []);

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [token]);

  return (
    <div className={navbar ? 'layout-header active' : 'layout-header'}>
      <div className="layout-header-left">
        {isLoggedIn && (
          <IconButton
            onClick={toggleSidebar}
            color="inherit"
            style={{ marginRight: '10px' }}
          >
            <MenuIcon style={{ fontSize: '30px' }} />
          </IconButton>
        )}
        <h1 className="animate__animated animate__fadeIn animate__infinite">
          Claim Management
        </h1>
      </div>

      <div className="layout-header-right">
        <Link to="/service" className="header-right-item">
          Services
        </Link>
        <Link to="/about" className="header-right-item">
          About
        </Link>
        <Link to="/contact" className="header-right-item">
          Contact
        </Link>
        {!isLoggedIn ? (
          <Link to="/login" className="header-right-item">
            Log In
          </Link>
        ) : (
          <div>
            <IconButton
              size="large"
              onClick={handleMenu}
            >
              <AccountCircleIcon sx={{ color: "#fff" }}/>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              disableScrollLock={true} // Giữ thanh cuộn
            >
              <MenuItem
                onClick={() => navigate("/profile")}
                sx={{
                  minWidth: "150px",
                  display: "flex",
                  alignItems: "center",
                  columnGap: "8px",
                }}
              >
                <AccountCircleIcon sx={{ color: "#727273" }} />
                <span className="flex-1">My Profile</span>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleClose}
                sx={{
                  minWidth: "150px",
                  display: "flex",
                  alignItems: "center",
                  columnGap: "8px",
                  color: "red",
                }}
              >
                <LogoutIcon />
                <button className="flex-1 text-left" onClick={() => setIsModalOpen(true)}>
                  Log Out
                </button>
              </MenuItem>
            </Menu>

            {/* Confirm logout */}
            <ConfirmModal
              isOpen={isModalOpen}
              title="Confirmation Logout"
              content="Are you sure want to log out?"
              onClose={() => setIsModalOpen(false)}
              onConfirm={handleLogOut}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;