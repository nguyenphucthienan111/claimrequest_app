import { useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import { styled } from "@mui/material/styles"; // Import styled
import { useNavigate } from "react-router-dom";
import {
  House as HouseIcon,
  Badge as BadgeIcon,
  RequestPage as RequestPageIcon,
  BusinessRounded as BusinessRoundedIcon,
  PeopleAltRounded as PeopleAltRoundedIcon,
  Task as TaskIcon,
  AssignmentTurnedInRounded as AssignmentTurnedInRoundedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckBox as CheckBoxIcon,
  Paid as PaidIcon,
} from "@mui/icons-material";
import { Role } from "../../constants/roles";

interface SideBarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const CustomListItemButton = styled(ListItemButton)({
  "&:hover": {
    background: "linear-gradient(to right, #dfdfdf, #D1D7F1)",
    "& .MuiListItemIcon-root": {
      color: "black",
    },
  },
});

const SideBar = ({ isOpen, toggleSidebar }: SideBarProps) => {
  const navigate = useNavigate();
  const [openManagement, setOpenManagement] = useState(false);
  const user = JSON.parse(localStorage.getItem("userData") || "{}");

  const menuItems = [
    { text: "Home", icon: <HouseIcon />, path: "/" },
    { text: "Dashboard", icon: <BadgeIcon />, path: "/dashboard" },
    { text: "View Project", icon: <TaskIcon />, path: "/viewprojects" },
    { text: "My Claims", icon: <RequestPageIcon />, path: "/my-requests" },
  ];

  const adminItems = [
    {
      text: "Management",
      icon: <BusinessRoundedIcon />,
      children: [
        { text: "Manage Staff", icon: <PeopleAltRoundedIcon />, path: "/admin/managestaff" },
        { text: "Manage Project", icon: <AssignmentTurnedInRoundedIcon />, path: "/admin/manageproject" },
      ],
    },
  ];

  const approvalItems = [
    {
      text: "Approve Claims",
      icon: <CheckBoxIcon />,
      path: "/approval/claims",
    },
  ];

  const financeItems = [{ 
    text: "Paid Claims", 
    icon: <PaidIcon />, 
    path: "/finance/claims" 
  }];

  const handleNavigation = (path: string) => {
    if (path === "/my-requests") {
      navigate("/user/my-requests");
    } else if (path === "/dashboard") {
      if (user?.role_code === "A004") navigate("/user/dashboard");
      else if (user?.role_code === "A001") navigate("/admin/dashboard");
      else if (user?.role_code === "A003") navigate("/approval/dashboard");
      else navigate("/#");
    } else {
      navigate(path);
    }
    toggleSidebar();
  };

  return (
    <Drawer open={isOpen} onClose={toggleSidebar}>
      <Box sx={{ width: 250 }} role="presentation">
        <List>
          {menuItems.map(({ text, icon, path }) => (
            <ListItem key={text} disablePadding>
              <CustomListItemButton onClick={() => handleNavigation(path)}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </CustomListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />

        {/* Admin Management */}
        <List>
          {user?.role_code === Role.ADMIN &&
            adminItems.map(({ text, icon, children }) => (
              <Box key={text}>
                <ListItem disablePadding>
                  <CustomListItemButton onClick={() => setOpenManagement(!openManagement)}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText primary={text} />
                    {openManagement ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </CustomListItemButton>
                </ListItem>

                <Collapse in={openManagement} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {children.map(({ text, icon, path }) => (
                      <ListItem key={text} disablePadding sx={{ pl: 1 }}>
                        <CustomListItemButton onClick={() => handleNavigation(path)}>
                          <ListItemIcon>{icon}</ListItemIcon>
                          <ListItemText primary={text} />
                        </CustomListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))}

          {user?.role_code === Role.APPROVER &&
            approvalItems.map(({ text, icon, path }) => (
              <ListItem key={text} disablePadding>
                <CustomListItemButton onClick={() => handleNavigation(path)}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={text} />
                </CustomListItemButton>
              </ListItem>
            ))}

          {user?.role_code === Role.FINANCE &&
            financeItems.map(({ text, icon, path }) => (
              <ListItem key={text} disablePadding>
                <CustomListItemButton onClick={() => handleNavigation(path)}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={text} />
                </CustomListItemButton>
              </ListItem>
            ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideBar;