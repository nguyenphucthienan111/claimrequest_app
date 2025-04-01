//Import từ React Router hoặc các hook liên quan
import React, { useEffect, useState } from "react";
import { useFormik, getIn } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
//Import từ thư viện bên ngoài
import { CircleX, Eye, Search } from "lucide-react";
import {
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  TablePagination,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
} from "@mui/material";
//Import các component dùng chung
import Layout from "../../../shared/layouts/Layout";
import BackButton from "../components/BackButton";
import SearchComponent from "../../../shared/components/searchComponent/Search";
import { searchUsers } from "../services/userService";
import DepartmentSelect from "../components/DepartmentSelect";
import useDebounce from "../../../shared/hooks/useDebounce";
//Import service, interface, and types
import {
  searchProject,
  addProject,
  deleteProject,
} from "../services/projectService";
import {
  Project,
  ProjectMember,
  User as ProjectUser,
} from "../types/projectInterface";
import { User } from "../types/user";
import RoleSelect from "../components/RoleSelect";
import { getRoleOptions } from "../services/roleService";
import Status from "../components/Status";

const hasFieldError = (formik: any, fieldName: string) => {
  const touched = getIn(formik.touched, fieldName);
  const error = getIn(formik.errors, fieldName);
  return touched && error;
};

const getFieldError = (formik: any, fieldName: string) => {
  return getIn(formik.errors, fieldName);
};

const ProjectManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedUserSearchTerm = useDebounce(userSearchTerm, 500);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [showUserDropdown, setShowUserDropdown] = useState<number | null>(null);
  const [isRolesLoaded, setIsRolesLoaded] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await searchProject(debouncedSearchTerm, page + 1, rowsPerPage);
        if (response.success && response.data) {
          setProjects(response.data.pageData);
          setTotalCount(response.data.pageInfo.totalItems);
        }
      } catch (error) {
        toast.error("Failed to fetch projects");
        setProjects([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [page, rowsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    if (openDialog) {
      fetchUsers();
    }
  }, [openDialog, debouncedUserSearchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await searchUsers(
        { keyword: debouncedUserSearchTerm },
        { pageNum: 1, pageSize: 100 }
      );
      if (response?.pageData) {
        setUsers(response.pageData);
        setFilteredUsers(response.pageData);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    }
  };

  const fetchRoles = async () => {
    try {
      await getRoleOptions();
      setIsRolesLoaded(true);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      toast.error('Failed to load roles');
    }
  };

  const validationSchema = Yup.object({
    project_name: Yup.string().required("Project name is required"),
    project_code: Yup.string().required("Project code is required"),
    project_department: Yup.string().required("Department is required"),
    project_description: Yup.string().required("Description is required"),
    project_start_date: Yup.date().required("Start date is required"),
    project_end_date: Yup.date()
      .required("End date is required")
      .min(Yup.ref("project_start_date"), "End date must be after start date"),
    project_members: Yup.array()
      .of(
        Yup.object().shape({
          user_id: Yup.string().required("User is required"),
          project_role: Yup.string().required("Role is required"),
          employee_id: Yup.string(),
          user_name: Yup.string(),
          full_name: Yup.string(),
        })
      )
      .min(1, "At least one project member is required"),
  });

  const formik = useFormik({
    initialValues: {
      project_name: "",
      project_code: "",
      project_department: "",
      project_description: "",
      project_start_date: new Date().toISOString().split("T")[0],
      project_end_date: new Date().toISOString().split("T")[0],
      project_members: [
        {
          user_id: "",
          project_role: "",
        },
      ] as ProjectMember[],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const projectData = {
          ...values,
          project_start_date: new Date(values.project_start_date).toISOString(),
          project_end_date: new Date(values.project_end_date).toISOString(),
          project_members: values.project_members.map((member) => {
            const user = users.find((u) => u._id === member.user_id);
            return {
              user_id: member.user_id,
              project_role: member.project_role,
              user_name: user?.user_name || "",
              email: user?.email || "",
              _id: member.user_id,
            } as ProjectUser;
          }),
        };

        await addProject(projectData);
        toast.success("Project added successfully!");

        const response = await searchProject("", 1);
        if (response.success && response.data) {
          setProjects(response.data.pageData);
          setTotalCount(response.data.pageInfo.totalItems);
          setPage(0);
        }

        handleCloseDialog();
      } catch (error) {
        toast.error("Failed to save project");
      }
    },
  });

  const handleAddMember = () => {
    formik.setFieldValue("project_members", [
      { user_id: "", project_role: "" } as ProjectMember,
      ...formik.values.project_members,
    ]);
    // Touch the fields to trigger validation
    formik.setFieldTouched(`project_members[0].user_id`, true, false);
    formik.setFieldTouched(`project_members[0].project_role`, true, false);
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = [...formik.values.project_members];
    updatedMembers.splice(index, 1);
    formik.setFieldValue("project_members", updatedMembers);
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...formik.values.project_members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value,
    } as ProjectMember;
    formik.setFieldValue("project_members", updatedMembers);
  };

  const handleOpenDialog = async () => {
    try {
      setAddLoading(true);
      await Promise.all([
        fetchUsers(),
        !isRolesLoaded && fetchRoles()
      ]);
      
      formik.resetForm();
      setOpenDialog(true);
    } catch (error) {
      console.error('Error opening dialog:', error);
      toast.error('Failed to load data');
    } finally {
      setAddLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
  };

  const handleOpenConfirmDialog = (id: string) => {
    setSelectedProjectId(id);
    setConfirmDialogOpen(true);
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/admin/manageproject/${projectId}`);
  };

  const handleConfirmDelete = async () => {
    if (selectedProjectId) {
      try {
        await deleteProject(selectedProjectId);
        setProjects((prev) => prev.filter((p) => p._id !== selectedProjectId));
        toast.success("Project deleted successfully!");
      } catch {
        toast.error("Failed to delete project");
      } finally {
        setConfirmDialogOpen(false);
        setSelectedProjectId(null);
      }
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    setPage(0); 
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleUserSearch = (index: number, searchValue: string) => {
    setUserSearchTerm(searchValue);
    setShowUserDropdown(index);

    if (searchValue.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
          user.user_name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleSelectUser = (index: number, user: User) => {
    handleMemberChange(index, "user_id", user._id);
    setShowUserDropdown(null);
    setUserSearchTerm("");
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); 
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        <div className="p-8">
          <BackButton to="/admin/dashboard" />
          <div className="flex justify-between items-center mb-6 ">
            <Typography variant="h5" className="text-4xl">
              Project Management
            </Typography>
            <SearchComponent onSearch={handleSearch} />
            <button
              title="Add New"
              className="group cursor-pointer outline-none hover:rotate-90 duration-300"
              onClick={handleOpenDialog}
              disabled={addLoading}
            >
              {addLoading ? (
                <div
                className="w-10 h-10 border-4 border-t-gray-500 border-gray-300 rounded-full animate-spin"
              ></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50px"
                  height="50px"
                  viewBox="0 0 24 24"
                  className="stroke-zinc-400 fill-none group-active:stroke-zinc-200 group-active:duration-0 duration-300"
                >
                  <path
                    d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                    strokeWidth="1.5"
                  ></path>
                  <path d="M8 12H16" strokeWidth="1.5"></path>
                  <path d="M12 16V8" strokeWidth="1.5"></path>
                </svg>
              )}
            </button>
          </div>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-300">
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#6B7280",
                      width: "25%",

                      fontSize: "17px",
                      borderRight: "2px solid #ffff",
                      textAlign: "center",
                    }}
                  >
                    Project Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#6B7280",
                      borderRight: "2px solid #ffff",
                      width: "15%",
                      textAlign: "center",
                    }}
                  >
                    Project Code
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
                    Start Date
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
                    End Date
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
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      backgroundColor: "#6B7280",
                      borderRight: "2px solid #ffff",
                      textAlign: "center",
                      width: "13%",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <div className="flex justify-center flex-row gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce"></div>
                        <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce [animation-delay:-.3s]"></div>
                        <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce [animation-delay:-.5s]"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project._id}>
                      <TableCell>{project.project_name}</TableCell>
                      <TableCell>{project.project_code}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {formatDate(project.project_start_date)}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {formatDate(project.project_end_date)}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Tooltip title={project.project_status} arrow placement="top">
                          <div className="flex items-center justify-center">
                            <Status 
                              color={
                                project.project_status === "New"
                                  ? "#6b7280"
                                  : project.project_status === "Active"
                                  ? "#22c55e"
                                  : project.project_status === "Pending"
                                  ? "#eab308"
                                  : project.project_status === "Closed"
                                  ? "#ef4444"
                                  : "#ffffff"
                              }
                            />
                          </div>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Button
                          sx={{
                            color: "gray",
                          }}
                          startIcon={<Eye />}
                          onClick={() => handleViewProject(project._id)}
                        ></Button>

                        <Button
                          color="warning"
                          startIcon={<CircleX />}
                          onClick={() => handleOpenConfirmDialog(project._id)}
                        ></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={handleRowsPerPageChange}
              labelDisplayedRows={({ from, to, count }) => {
                return `${from}-${to} of ${count}`;
              }}
              showFirstButton
              showLastButton
            />
          </TableContainer>
        </div>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
          classes={{ paper: "rounded-lg" }}
        >
          <DialogTitle className="bg-gray-500 border-b border-gray-200 py-4">
            <h2 className="text-xl font-semibold text-gray-50">Add Project</h2>
          </DialogTitle>
          <DialogContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-1">
                <TextField
                  fullWidth
                  label="Project Name *"
                  {...formik.getFieldProps("project_name")}
                  error={
                    formik.touched.project_name &&
                    Boolean(formik.errors.project_name)
                  }
                  helperText={
                    formik.touched.project_name && formik.errors.project_name
                  }
                  className="bg-white"
                  InputProps={{
                    className: "rounded-md",
                  }}
                />
              </div>

              <div className="space-y-1">
                <TextField
                  fullWidth
                  label="Project Code *"
                  {...formik.getFieldProps("project_code")}
                  error={
                    formik.touched.project_code &&
                    Boolean(formik.errors.project_code)
                  }
                  helperText={
                    formik.touched.project_code && formik.errors.project_code
                  }
                  className="bg-white"
                  InputProps={{
                    className: "rounded-md",
                  }}
                />
              </div>

              <div className="space-y-1">
                <FormControl
                  fullWidth
                  error={
                    formik.touched.project_department &&
                    Boolean(formik.errors.project_department)
                  }
                  className="bg-white rounded-md"
                >
                  <InputLabel
                    shrink
                    id="department-select-label"
                    className="bg-white px-1 text-gray-600"
                  >
                    Department *
                  </InputLabel>
                  <div className="mt-2">
                    <DepartmentSelect
                      value={formik.values.project_department}
                      onChange={(value) =>
                        formik.setFieldValue("project_department", value)
                      }
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Select Department"
                    />
                  </div>
                  {formik.touched.project_department &&
                    formik.errors.project_department && (
                      <p className="text-red-500 text-xs mt-1">
                        {formik.errors.project_department as string}
                      </p>
                    )}
                </FormControl>
              </div>

              <div className="space-y-1 md:col-span-2">
                <TextField
                  fullWidth
                  label="Description *"
                  multiline
                  rows={3}
                  {...formik.getFieldProps("project_description")}
                  error={
                    formik.touched.project_description &&
                    Boolean(formik.errors.project_description)
                  }
                  helperText={
                    formik.touched.project_description &&
                    formik.errors.project_description
                  }
                  className="bg-white"
                  InputProps={{
                    className: "rounded-md",
                  }}
                />
              </div>

              <div className="space-y-1">
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...formik.getFieldProps("project_start_date")}
                  error={
                    formik.touched.project_start_date &&
                    Boolean(formik.errors.project_start_date)
                  }
                  helperText={
                    formik.touched.project_start_date &&
                    formik.errors.project_start_date
                  }
                  className="bg-white"
                  InputProps={{
                    className: "rounded-md",
                  }}
                />
              </div>

              <div className="space-y-1">
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...formik.getFieldProps("project_end_date")}
                  error={
                    formik.touched.project_end_date &&
                    Boolean(formik.errors.project_end_date)
                  }
                  helperText={
                    formik.touched.project_end_date &&
                    formik.errors.project_end_date
                  }
                  className="bg-white"
                  InputProps={{
                    className: "rounded-md",
                  }}
                />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                <Typography
                  variant="h6"
                  className="text-gray-700 font-semibold"
                >
                  Project Members *
                </Typography>
                <Button
                  sx={{
                    color: "white",
                    backgroundColor: "gray",
                    "&:hover": { backgroundColor: "darkgray" },
                  }}
                  onClick={handleAddMember}
                  className="rounded-md"
                  size="small"
                >
                  Add Member
                </Button>
              </div>

              {formik.values.project_members.map((member, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex flex-row justify-between items-center">
                    <div className="w-full pr-2">
                      <div className="relative">
                        <TextField
                          fullWidth
                          label="Search User *"
                          placeholder="Search by username or email"
                          value={
                            showUserDropdown === index
                              ? userSearchTerm
                              : users.find((u) => u._id === member.user_id)
                                  ?.user_name || ""
                          }
                          onChange={(e) =>
                            handleUserSearch(index, e.target.value)
                          }
                          onFocus={() => setShowUserDropdown(index)}
                          className="bg-white rounded-md"
                          error={hasFieldError(formik, `project_members[${index}].user_id`)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Search size={20} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        {hasFieldError(formik, `project_members[${index}].user_id`) && (
                          <p className="text-red-500 text-xs mt-1">
                            {getFieldError(formik, `project_members[${index}].user_id`)}
                          </p>
                        )}
                        {showUserDropdown === index && (
                          <Paper
                            style={{
                              position: "absolute",
                              zIndex: 1000,
                              width: "100%",
                              maxHeight: "200px",
                              overflow: "auto",
                            }}
                          >
                            <List>
                              {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                  <ListItem
                                    key={user._id}
                                    onClick={() =>
                                      handleSelectUser(index, user)
                                    }
                                    divider
                                    sx={{ cursor: "pointer" }}
                                  >
                                    <ListItemText
                                      primary={user.user_name}
                                      secondary={user.email}
                                    />
                                  </ListItem>
                                ))
                              ) : (
                                <ListItem>
                                  <ListItemText primary="No users found" />
                                </ListItem>
                              )}
                            </List>
                          </Paper>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        color="error"
                        onClick={() => handleRemoveMember(index)}
                        disabled={formik.values.project_members.length <= 1}
                        className="rounded-md"
                        variant="outlined"
                        size="small"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="w-full">
                    <FormControl
                      fullWidth
                      error={hasFieldError(formik, `project_members[${index}].project_role`)}
                      className="bg-white rounded-md"
                    >
                      <InputLabel
                        shrink
                        id={`role-select-label-${index}`}
                        className="bg-white px-1 text-gray-600"
                      >
                        Role *
                      </InputLabel>
                      <div className="mt-2">
                        <RoleSelect
                          value={
                            (formik.values.project_members[index] as any)
                              .project_role || ""
                          }
                          onChange={(value) =>
                            handleMemberChange(index, "project_role", value)
                          }
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {hasFieldError(formik, `project_members[${index}].project_role`) && (
                        <p className="text-red-500 text-xs mt-1">
                          {getFieldError(formik, `project_members[${index}].project_role`)}
                        </p>
                      )}
                    </FormControl>
                  </div>
                </div>
              ))}

              {formik.touched.project_members &&
                typeof formik.errors.project_members === "string" && (
                  <Typography color="error" className="mt-2 text-sm">
                    {formik.errors.project_members}
                  </Typography>
                )}
            </div>
          </DialogContent>
          <DialogActions className="bg-gray-100 border-t border-gray-200 p-4 flex justify-end gap-2">
            <Button
              onClick={handleCloseDialog}
              sx={{
                color: "gray",
              }}
              className="bg-white text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md border border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => formik.handleSubmit()}
              variant="contained"
              sx={{
                color: "white",
                backgroundColor: "gray",
                "&:hover": { backgroundColor: "darkgray" },
              }}
              className="text-white px-6 py-2 rounded-md"
            >
              Save Project
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this project?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmDialogOpen(false)}
              sx={{ color: "gray" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              sx={{
                backgroundColor: "gray",
                color: "white",
                "&:hover": { backgroundColor: "darkgray" },
              }}
              variant="contained"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ProjectManagementPage;
