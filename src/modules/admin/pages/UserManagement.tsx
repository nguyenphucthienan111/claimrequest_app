import { useEffect, useState, useCallback } from "react";
import Preloader from "../../../shared/components/Preloader";
import BackButton from "../components/BackButton";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  searchUsers,
  createUser,
  updateUser,
  changeUserStatus,
  deleteUser,
  changeUserRole,
  getEmployeeById,
  updateEmployee,
} from "../services/userService";
import Layout from "../../../shared/layouts/Layout";
import {
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  CardContent,
  Card,
  Typography,
  MenuItem,
  InputLabel,
  TablePagination
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Select from "@mui/material/Select";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import { User, Employee } from "../types/user";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Pencil, CircleX, Plus, Search, Lock, Unlock, Eye } from "lucide-react";
import { debounce} from "lodash";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupOpen2, setPopupOpen2] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pageNum, setPageNum] = useState(1); //  Track current page
  const [pageSize, setPageSize] = useState(5); //  Items per page
  const [totalPages, setTotalPages] = useState(1); // Total pages from API
  const [viewUser, setViewUser] = useState<User | null>(null); //View detail
 // const [userId, setUserId] = useState("");
  const [employeeData, setEmployeeData] = useState<Employee>({
    _id: "",
    user_id: "",
    job_rank: "",
    contract_type: "",
    address: "",
    phone: "",
    full_name: "",
    avatar_url: "",
    department_code: "",
    salary: 0,
    end_date: new Date(),
    updated_by: "",
    start_date: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
  });

  const roleMap: Record<string, string> = {
    A001: "Admin",
    A002: "Finance",
    A003: "Approval",
    A004: "Member",
  };

  interface UserForm {
    email: string;
    user_name: string;
    role_code: string;
    password?: string;
    confirmPassword?: string;
  }
  
  const [form, setForm] = useState<UserForm>({
    email: "",
    user_name: "",
    role_code: "A001",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => {
    if (editingUser) {
      setForm((prev: UserForm) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      setErrors({});
    } else {
      setForm({
        email: "",
        user_name: "",
        role_code: "A001",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
    }
  }, [editingUser]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.user_name.trim()) newErrors.user_name = "Username is required";
    if (!editingUser && !form.password?.trim()) {
        newErrors.password = "Password is required";
    } else if (!editingUser && (form.password?.length ?? 0) < 6) {
        newErrors.password = "Password must be at least 6 characters";
    }
    if (!editingUser && form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
};

  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: User | null;
    action: "delete" | "block" | null;
  }>({
    open: false,
    user: null,
    action: null,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await searchUsers(
        { keyword: searchTerm.trim() },
        { pageNum, pageSize }
      );
      console.log("Users type check:", Array.isArray(response.pageData)); // Should be true
      console.log("Parsed Users:", response.pageData); //  Debug users
      if (response?.pageData && response?.pageInfo) {
        setUsers(response.pageData); //  Correctly setting users
        setTotalPages(response.pageInfo.totalPages || 1); //  Fix pagination
      } else {
        toast.error(`Invalid API response: ${JSON.stringify(response)}`);
        setUsers([]); // 🛠 Prevent crashes
      }
    } catch (error) {
      toast.error(`Failed to fetch users: ${error instanceof Error ? error.message : JSON.stringify(error)}`);

      setUsers([]); // 🛠 Prevent UI crash
    } finally {
      setLoading(false);
    }
  };
  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 800), [
    searchTerm,
    pageNum,
  ]);
  useEffect(() => {
    debouncedFetchUsers();
    return () => debouncedFetchUsers.cancel();
  }, [debouncedFetchUsers]); 

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!validateForm()) return;
      if (editingUser) {
        // Check if role changed
        if (editingUser.role_code !== form.role_code) {
          await changeUserRole(editingUser._id, form.role_code);
        }

        // Updating an existing user
        await updateUser(editingUser._id, {
          email: form.email,
          user_name: form.user_name,
        });
        toast.success("User updated successfully!");
      } else {
        // Creating a new user
        await createUser({
          email: form.email,
          user_name: form.user_name,
          role_code: form.role_code,
          password: form.password ?? "", // Password required for new user
        });
        toast.success("User created successfully!");
      }

      setPopupOpen(false); // Close popup after saving
      fetchUsers(); // Refresh the user list
    } catch (error) {
      toast.error(`Failed to save users: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }finally {
      setLoading(false); // Set loading to false
    }
  };

  const handleConfirmAction = async () => {
    setLoading(true);
    if (!confirmDialog.user || !confirmDialog.action) return;
    try {
      if (confirmDialog.action === "block") {
        await changeUserStatus(
          confirmDialog.user._id,
          !confirmDialog.user.is_blocked
        );
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === confirmDialog.user!._id
              ? { ...u, is_blocked: !confirmDialog.user!.is_blocked }
              : u
          )
        );
      } else if (confirmDialog.action === "delete") {
        await deleteUser(confirmDialog.user._id);
        fetchUsers();
      }
    } catch (error) {
      toast.error(`Failed to ${confirmDialog.action} user: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setConfirmDialog({ open: false, user: null, action: null });
      setLoading(false);
    }
  };

  const handleOpenEmployeeDetails = async (id: string) => {
    console.log("Fetching details for User ID:", id);

    if (!id) {
      toast.error("Invalid User ID");
      console.error("Invalid User ID: ID is missing");
      return;
    }

    try {
      const employee = await getEmployeeById(id); // Now TypeScript knows `employee` has all properties
    
      console.log("Fixed Response Data:", employee);
    
      if (!employee || Object.keys(employee).length === 0) {
        throw new Error("No employee data found");
      }
    
      // Set state without TypeScript errors
      setEmployeeData({
        _id: employee._id,
        user_id: employee.user_id,
        job_rank: employee.job_rank,
        contract_type: employee.contract_type,
        address: employee.address,
        avatar_url: employee.avatar_url,
        department_code: employee.department_code,
        end_date: new Date(employee.end_date),
        full_name: employee.full_name,
        is_deleted: employee.is_deleted,
        phone: employee.phone,
        salary: employee.salary,
        start_date: new Date(employee.start_date),
        created_at: employee.created_at ? new Date(employee.created_at) : new Date(),
        updated_at: employee.updated_at ? new Date(employee.updated_at) : new Date(),
        updated_by: employee.updated_by,
      });
    
      setPopupOpen2(true);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast.error(error instanceof Error ? error.message : "Error fetching employee details");
    }
  };

  const handleSaveEmployeeDetails = async () => {
    try {
      console.log("Sending to API:", employeeData);
  
      // Validate the payload
      if (!employeeData.user_id || !employeeData.job_rank || !employeeData.contract_type) {
        throw new Error("Missing required fields in employee data");
      }
  
      // Send the request to update the employee
      await updateEmployee(employeeData.user_id, { ...employeeData });
  
      toast.success("Employee updated successfully!");
    } catch (error) {
      console.error("Error updating employee details:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error updating employee details"
      );
    }
  };
  
  
  const handleRoleChange = async (userId: string, newRoleCode: string) => {
    if (!userId) return;

    const userToUpdate = users.find((u) => u._id === userId);
    if (!userToUpdate || userToUpdate.role_code === newRoleCode) return;
    setLoading(true);
    try {
      await changeUserRole(userId, newRoleCode);

      // Cập nhật state để UI phản ánh ngay lập tức
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role_code: newRoleCode } : user
        )
      );
      toast.success("User role updated successfully!");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(`Error updating role: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        <BackButton to="/admin/dashboard" />
        <h1 className="text-6xl p-4 font-mono bold bg-gray-100">
          USER MANAGEMENT
        </h1>
        <div className="p-4 bg-gray-100">
        {loading && <Preloader />}
          <div className="flex justify-end items-center gap-4 mb-4">
            <div className="w-[250px] min-w-[150px] ">
              <div className="relative">
                <input
                  placeholder="Search..."
                  className="input bg-white shadow-sm focus:border-2 border-gray-300 px-5 py-3 rounded-xl w-180 transition-all outline-none [&::-webkit-search-cancel-button]:hidden [&::-moz-search-clear-button]:hidden"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    position: "absolute",
                    border: "100px !important ",
                    backgroundColor: "white",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",

                    transition: "ease-in-out",

                    width: "28rem",
                    overflow: "hidden",
                    left: "-200px",
                    top: "-22px",
                  }}
                />
                <Search className="absolute right-3 -top-2.5" />
              </div>
            </div>
            <Dialog
              open={popupOpen}
              onClose={() => {
                setPopupOpen(false); // Close the dialog
                setForm({
                  email: "",
                  user_name: "",
                  role_code: "A001",
                  password: "",
                  confirmPassword: "",
                }); // Reset the form
                setErrors({}); // Clear errors
              }}
              sx={{
                "& .MuiPaper-root": {
                  borderRadius: "12px",
                  padding: "20px",
                  width: "500px",
                },
              }}
            >
              <DialogTitle>
                <Typography variant="h6" fontWeight="bold" fontSize="27px">
                  {editingUser ? "Edit User" : "Create  new user"}
                </Typography>
              </DialogTitle>

              <DialogContent>
                {/* Email Field */}
                Email<span className="text-red-600">*</span>
                <TextField
                  type="email"
                  fullWidth
                  margin="dense"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{
                    backgroundColor: "#E3F2FD",
                    borderRadius: "6px",
                    color: "gray",
                  }}
                />
                {/* Username Field */}
                Username<span className="text-red-600">*</span>
                <TextField
                  fullWidth
                  margin="dense"
                  value={form.user_name}
                  onChange={(e) =>
                    setForm({ ...form, user_name: e.target.value })
                  }
                  error={!!errors.user_name}
                  helperText={errors.user_name}
                  sx={{
                    backgroundColor: "#E3F2FD",
                    borderRadius: "6px",
                    color: "gray",
                  }}
                />
                  {/* Role Dropdown (ONLY for Adding New User) */}
                  {!editingUser && (
                    <>
                      Role<span className="text-red-600">*</span>
                      <Select
                        fullWidth
                        margin="dense"
                        value={form.role_code}
                        onChange={(e) => setForm({ ...form, role_code: e.target.value })}
                        sx={{
                          backgroundColor: "#E3F2FD",
                          borderRadius: "6px",
                        }}
                      >
                        {Object.entries(roleMap).map(([code, label]) => (
                          <MenuItem key={code} value={code}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </>
                  )}

                {/* Password Field (ONLY for Adding New User) */}
                <span
                  style={{ visibility: editingUser ? "hidden" : "visible" }}
                >
                  Password<span className="text-red-600">*</span>
                </span>
                {!editingUser && (
                  <TextField
                    fullWidth
                    margin="dense"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    error={!!errors.password}
                    helperText={errors.password}
                    sx={{ backgroundColor: "#E3F2FD", borderRadius: "6px" }}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      ),
                    }}
                  />
                )}
                {/* Confirm Password Field */}
                <span
                  style={{ visibility: editingUser ? "hidden" : "visible" }}
                >
                  Confirm Password<span className="text-red-600">*</span>
                </span>
                {!editingUser && (
                  <TextField
                    fullWidth
                    margin="dense"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    sx={{ backgroundColor: "#E3F2FD", borderRadius: "6px" }}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      ),
                    }}
                  />
                )}
              </DialogContent>

              <DialogActions>
              <Button 
                onClick={() => {
                  setPopupOpen(false); // Close the dialog
                  setForm({
                    email: "",
                    user_name: "",
                    role_code: "A001",
                    password: "",
                    confirmPassword: "",
                  }); // Reset the form
                  setErrors({}); // Clear errors
                }}
                color="error"
              >
                Cancel
              </Button>
                <Button onClick={handleSave} color="primary">
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              open={Boolean(viewUser)}
              onClose={() => setViewUser(null)}
              sx={{}}
            >
              <DialogTitle
                sx={{
                  font: "bold",
                  fontSize: "50px",
                }}
              >
                User Details
              </DialogTitle>
              <DialogContent>
                {viewUser && (
                  <Grid container spacing={2}>
                    {/* UserID */}
                    <Grid item xs={12}>
                      <Card sx={{ backgroundColor: "#EAF2FF" }}>
                        <CardContent>
                          <Typography
                            fontWeight="bold"
                            sx={{
                              color: "#3EAEF4",
                            }}
                          >
                            UserID
                          </Typography>
                          <Typography>{viewUser._id}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Username */}
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ backgroundColor: "#EAF2FF" }}>
                        <CardContent>
                          <Typography
                            fontWeight="bold"
                            sx={{
                              color: "#3EAEF4",
                            }}
                          >
                            Username
                          </Typography>
                          <Typography>{viewUser.user_name}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ backgroundColor: "#F5EFFF" }}>
                        <CardContent>
                          <Typography
                            fontWeight="bold"
                            sx={{
                              color: "#FF99FF",
                            }}
                          >
                            Email
                          </Typography>
                          <Typography>{viewUser.email}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Role */}
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ backgroundColor: "#E6FAE6" }}>
                        <CardContent>
                          <Typography
                            fontWeight="bold"
                            sx={{
                              color: "#00FF66",
                            }}
                          >
                            Role
                          </Typography>
                          <Typography>{roleMap[viewUser.role_code]}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Created At */}
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ backgroundColor: "#EAF2FF" }}>
                        <CardContent>
                          <Typography
                            fontWeight="bold"
                            sx={{
                              color: "#3EAEF4",
                            }}
                          >
                            Created At
                          </Typography>
                          <Typography>{viewUser.created_at?.toLocaleString()}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Updated At */}
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ backgroundColor: "#FFEAF2" }}>
                        <CardContent>
                          <Typography
                            fontWeight="bold"
                            sx={{
                              color: "#FFCC99",
                            }}
                          >
                            Updated At
                          </Typography>
                          <Typography>{viewUser.updated_at?.toLocaleString()}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setViewUser(null)} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setEditingUser(null); // Reset editing state
                setForm({
                  email: "",
                  user_name: "",
                  role_code: "A001",
                  password: "",
                  confirmPassword: "",
                }); // Reset form
                setPopupOpen(true); // Open popup
              }}
              sx={{
                backgroundColor: "blue", // Màu cam
                color: "white", // Màu chữ trắng
                fontWeight: "bold",
                textTransform: "none", // Không in hoa
                borderRadius: "30px", // Bo tròn
                padding: "10px 20px", // Kích thước padding
                fontSize: "16px", // Cỡ chữ
                "&:hover": {
                  backgroundColor: "Navy", // Màu khi hover
                },
                display: "flex",
                alignItems: "center",
                gap: "8px", // Khoảng cách giữa icon và chữ
              }}
            >
              <Plus />
              Create Account
            </Button>
          </div>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#6B7280",
                      width: "20%",

                      fontSize: "17px",
                      borderRight: "2px solid #ffff",
                      textAlign: "center",
                    }}
                  >
                    Username
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#6B7280",
                      borderRight: "2px solid #ffff",
                      width: "30%",
                      textAlign: "center",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#6B7280",
                      borderRight: "2px solid #ffff",
                      textAlign: "center",
                    }}
                  >
                    Role
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#6B7280",
                      borderRight: "2px solid #ffff",
                      textAlign: "center",
                    }}
                  >
                    Blocked
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#6B7280",
                      textAlign: "center",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow>
                    <TableCell>{user.user_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderRadius: "15px",

                        color:
                          user.role_code === "A001"
                            ? "#D32F2F" // Đỏ đậm
                            : user.role_code === "A002"
                            ? "#FBC02D" // Vàng đậm
                            : user.role_code === "A003"
                            ? "#388E3C" // Xanh lá đậm
                            : "#424242", // Xám đậm
                      }}
                    >
                      <Select
                        value={user.role_code}
                        onChange={(event) =>
                          handleRoleChange(user._id, event.target.value)
                        }
                        sx={{
                          fontWeight: "bold",
                          color: "inherit",
                          backgroundColor: "transparent",
                          "& .MuiSelect-icon": { color: "inherit" },
                        }}
                      >
                        <MenuItem value="A001" sx={{ color: "#D32F2F" }}>
                          Admin
                        </MenuItem>
                        <MenuItem value="A002" sx={{ color: "#FBC02D" }}>
                          Finance
                        </MenuItem>
                        <MenuItem value="A003" sx={{ color: "#388E3C" }}>
                          Approval
                        </MenuItem>
                        <MenuItem value="A004" sx={{ color: "black" }}>
                          Member
                        </MenuItem>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Button
                        onClick={() =>
                          setConfirmDialog({
                            open: true,
                            user,
                            action: "block",
                          })
                        }
                        variant="contained"
                        startIcon={
                          user.is_blocked ? (
                            <Lock size={16} />
                          ) : (
                            <Unlock size={16} />
                          )
                        }
                        sx={{
                          textAlign: "center",
                          textTransform: "none", // Không viết hoa chữ
                          borderRadius: "12px", // Bo tròn góc
                          fontWeight: 600, // Chữ đậm
                          backgroundColor: user.is_blocked
                            ? "#FF3B30"
                            : "#34C759",
                          "&:hover": {
                            backgroundColor: user.is_blocked
                              ? "#D32F2F"
                              : "#2E7D32", // Màu khi hover
                          },
                        }}
                      >
                        {user.is_blocked ? "Locked" : "Unlocked"}
                      </Button>
                    </TableCell>

                    <TableCell sx={{ textAlign: "center" }}>
                      <Button onClick={() => setViewUser(user)}>
                        <Eye />
                      </Button>

                      <Button
                        color="inherit"
                        onClick={() => {
                          setEditingUser(user); // Set user being edited
                          setForm({
                            email: user.email,
                            user_name: user.user_name,
                            role_code: user.role_code,
                          });
                          setPopupOpen(true); // Open popup
                        }}
                      >
                        <Pencil size={18} />
                      </Button>

                      <Button
                        color="warning"
                        onClick={() =>
                          setConfirmDialog({
                            open: true,
                            user,
                            action: "delete",
                          })
                        }
                      >
                        <CircleX size={18} />
                      </Button>

                      <Button
                        onClick={() => {
                          console.log("Selected User ID:", user._id); // ✅ Check if user.id exists
                          handleOpenEmployeeDetails(user._id);
                        }}
                      >
                        <AccessibilityIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <TablePagination
          component="div"
          count={totalPages * pageSize} // Total items
          page={pageNum - 1} // Zero-based index
          onPageChange={(_, newPage) => setPageNum(newPage + 1)} // Update pageNum
          rowsPerPage={pageSize}
          onRowsPerPageChange={(event) => {
            setPageNum(1); // Reset to first page
            setPageSize(parseInt(event.target.value, 10)); // Update pageSize
          }}
          rowsPerPageOptions={[5, 10, 20, 50]} // Items per page
        />
        <Dialog
          open={confirmDialog.open}
          onClose={() =>
            setConfirmDialog({ open: false, user: null, action: null })
          }
        >
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to{" "}
              {confirmDialog.action === "delete"
                ? "delete"
                : confirmDialog.user?.is_blocked
                ? "unblock"
                : "block"}{" "}
              this user?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setConfirmDialog({ open: false, user: null, action: null })
              }
              color="error"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmAction} color="success">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={popupOpen2} onClose={() => setPopupOpen2(false)}>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogContent>
            {/* Employee Fields */}
            {employeeData && (
              <>
                 <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                  <Avatar
                    alt={employeeData.full_name}
                    src={employeeData.avatar_url}
                    sx={{ width: 150, height: 150 }}
                  />
                </div>
                <TextField
                  label="Avatar URL"
                  value={employeeData.avatar_url}
                  onChange={(e) =>
                    setEmployeeData({
                      ...employeeData,
                      avatar_url: e.target.value,
                    })
                  }
                  fullWidth
                  margin="dense"
                />
                <TextField
                  label="Full Name"
                  value={employeeData.full_name}
                  onChange={(e) =>
                    setEmployeeData({
                      ...employeeData,
                      full_name: e.target.value,
                    })
                  }
                  fullWidth
                  margin="dense"
                />
                <TextField
                  label="UserID"
                  value={employeeData.user_id}
                  onChange={(e) =>
                    setEmployeeData({
                      ...employeeData,
                      user_id: e.target.value,
                    })
                  }
                  fullWidth
                  margin="dense"
                />
                <TextField
                  label="Phone"
                  value={employeeData.phone}
                  onChange={(e) =>
                    setEmployeeData({ ...employeeData, phone: e.target.value })
                  }
                  fullWidth
                  margin="dense"
                />
                <TextField
                  label="Address"
                  value={employeeData.address}
                  onChange={(e) =>
                    setEmployeeData({
                      ...employeeData,
                      address: e.target.value,
                    })
                  }
                  fullWidth
                  margin="dense"
                />
                <FormControl fullWidth margin="dense">
                <InputLabel id="job-rank-label">Job Rank</InputLabel>
                <Select
                  labelId="job-rank-label"
                  value={employeeData.job_rank || ""}
                  onChange={(e) => setEmployeeData({ ...employeeData, job_rank: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                  </MenuItem>
                  {[
                    "TC3", "TC2", "TC1",
                    "TEST3", "TEST2", "TEST1",
                    "DEV3", "DEV2", "DEV1",
                    "QA3", "QA2", "QA1",
                    "BA3", "BA2", "BA1",
                    "TL3", "TL2", "TL1",
                    "PM3", "PM2", "PM1",
                    "BUL", "FI3", "FI2", "FI1",
                    "Admin"
                  ].map((job_rank) => (
                    <MenuItem key={job_rank} value={job_rank}>
                      {job_rank}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

               <FormControl fullWidth margin="dense">
                <InputLabel>Department Code</InputLabel>
                <Select
                  value={employeeData.department_code || ""}
                  onChange={(e) => setEmployeeData({ ...employeeData, department_code: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="" disabled></MenuItem>
                  {["DE01", "DE02", "DE03", "DE04"].map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
                <FormControl fullWidth margin="dense">
                <InputLabel>Contract Type</InputLabel>
                <Select
                  value={employeeData.contract_type || ""}
                  onChange={(e) =>
                    setEmployeeData({ ...employeeData, contract_type: e.target.value })
                  }
                  displayEmpty
                >
                  <MenuItem value="" disabled></MenuItem>
                  {["INDEFINITE", "THREE YEAR", "ONE YEAR"].map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Salary"
                type="number"
                value={employeeData.salary}
                onChange={(e) =>
                  setEmployeeData({
                    ...employeeData,
                    salary: Number(e.target.value),
                  })
                }
                fullWidth
                margin="dense"
                slotProps={{
                  htmlInput: { inputMode: "numeric", style: { textAlign: "right" } }, // ✅ Use slotProps.htmlInput
                }}
              />

                <div style={{ textAlign: "right" }}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={employeeData.start_date ? format(employeeData.start_date, "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setEmployeeData({ ...employeeData, start_date: new Date(e.target.value) })
                    }
                    fullWidth
                    margin="dense"
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                </div>

                <div style={{ textAlign: "right" }}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={employeeData.end_date ? format(employeeData.end_date, "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setEmployeeData({ ...employeeData, end_date: new Date(e.target.value) })
                    }
                    fullWidth
                    margin="dense"
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                </div>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPopupOpen2(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSaveEmployeeDetails} color="primary" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Layout>
  );
};

export default UserManagement;
