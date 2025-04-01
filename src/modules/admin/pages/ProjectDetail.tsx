import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import { fetchProjectById } from "../services/projectService";
import { Project, User } from "../types/projectInterface";
import Layout from "../../../shared/layouts/Layout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { deleteProject, changeProjectStatus } from "../services/projectService";
import { updateProject } from "../services/projectService";
import { useFormik } from "formik";
import * as Yup from "yup";
import { searchUsers } from "../services/userService";
import { Search } from "lucide-react";
import DepartmentSelect from "../components/DepartmentSelect";
import useDebounce from "../../../shared/hooks/useDebounce";
import { getRoleOptions } from "../services/roleService";
import Status from "../components/Status";
// import { User as ApiUser } from "../types/user";
// import { ApiResponse } from "../types/apiResponse";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const navigate = useNavigate();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [roleOptions, setRoleOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isRolesLoaded, setIsRolesLoaded] = useState(false);
  const debouncedUserSearchTerm = useDebounce(userSearchTerm, 500);
  const [showUserDropdown, setShowUserDropdown] = useState<number | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId)
        .then((response) => {
          if (response.success && response.data) {
            setProject(response.data);
          } else {
            toast.error(response.message || "Failed to fetch project details");
          }
        })
        .catch((err) => {
          console.error("Error fetching project:", err);
          toast.error("Error loading project details");
        });
    }
  }, [projectId]);

  useEffect(() => {
    if (editDialogOpen) {
      fetchUsers();
    }
  }, [editDialogOpen, debouncedUserSearchTerm]);

  const validationSchema = Yup.object({
    project_name: Yup.string().required("Project name is required"),
    project_code: Yup.string().required("Project code is required"),
    project_department: Yup.string().required("Department is required"),
    project_description: Yup.string().required("Description is required"),
    project_start_date: Yup.date().required("Start date is required"),
    project_end_date: Yup.date()
      .required("End date is required")
      .min(Yup.ref("project_start_date"), "End date must be after start date"),
  });

  const formik = useFormik({
    initialValues: {
      project_name: project?.project_name || "",
      project_code: project?.project_code || "",
      project_department: project?.project_department || "",
      project_description: project?.project_description || "",
      project_start_date: project?.project_start_date
        ? project.project_start_date.split("T")[0]
        : "",
      project_end_date: project?.project_end_date
        ? project.project_end_date.split("T")[0]
        : "",
      project_members: project?.project_members || [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await updateProject({
          _id: project?._id!,
          ...values,
          project_members: values.project_members,
          project_status: project?.project_status || "ACTIVE",
        });
        toast.success("Project updated successfully!");
        setEditDialogOpen(false);
        if (projectId) {
          const response = await fetchProjectById(projectId);
          if (response.success && response.data) {
            setProject(response.data);
          }
        }
      } catch (error) {
        toast.error("Failed to update project");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleOpenEditDialog = async () => {
    try {
      setLoading(true);

      await Promise.all([fetchUsers(), !isRolesLoaded && fetchRoles()]);

      formik.resetForm({
        values: {
          project_name: project?.project_name || "",
          project_code: project?.project_code || "",
          project_department: project?.project_department || "",
          project_description: project?.project_description || "",
          project_start_date: project?.project_start_date?.split("T")[0] || "",
          project_end_date: project?.project_end_date?.split("T")[0] || "",
          project_members: project?.project_members || [],
        },
      });
      setEditDialogOpen(true);
    } catch (error) {
      console.error("Error opening edit dialog:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await searchUsers(
        { keyword: debouncedUserSearchTerm },
        { pageNum: 1, pageSize: 100 }
      );
      if (response?.pageData) {
        // Map API users to project users format
        const projectUsers: User[] = response.pageData.map(user => ({
          _id: user._id,
          user_name: user.user_name,
          email: user.email || '',
          project_role: ''
        }));
        setUsers(projectUsers);
        setFilteredUsers(projectUsers);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    }
  };

  const fetchRoles = async () => {
    try {
      const options = await getRoleOptions();
      setRoleOptions(options);
      setIsRolesLoaded(true);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to load roles");
    }
  };

  const handleAddMember = () => {
    formik.setFieldValue("project_members", [
      {
        _id: "",
        user_id: "",
        user_name: "",
        email: "",
        project_role: "",
      },
      ...formik.values.project_members,
    ]);
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = [...formik.values.project_members];
    updatedMembers.splice(index, 1);
    formik.setFieldValue("project_members", updatedMembers);
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...formik.values.project_members];
    if (field === "user_id") {
      const selectedUser = users.find((user) => user._id === value);
      updatedMembers[index] = {
        ...updatedMembers[index],
        _id: value,
        user_id: value,
        user_name: selectedUser?.user_name || "",
        email: selectedUser?.email || "",
        project_role: updatedMembers[index].project_role || "",
      };
    } else {
      updatedMembers[index] = {
        ...updatedMembers[index],
        [field]: value,
      };
    }
    formik.setFieldValue("project_members", updatedMembers);
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

  const handleSelectUser = (index: number, user: any) => {
    handleMemberChange(index, "user_id", user._id);
    setShowUserDropdown(null);
    setUserSearchTerm("");
  };

  const handleStatusChange = async () => {
    if (!projectId) return;

    try {
      const response = await changeProjectStatus(
        projectId,
        newStatus,
        statusComment
      );
      if (response.success) {
        const projectResponse = await fetchProjectById(projectId);
        if (projectResponse.success && projectResponse.data) {
          setProject(projectResponse.data);
          toast.success("Project status updated successfully!");
          setStatusDialogOpen(false);
        }
      } else {
        toast.error(response.message || "Failed to update project status");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update project status");
    }
  };

  const handleOpenStatusDialog = (status: string) => {
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  if (!project) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-row gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce [animation-delay:-.5s]"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (project?._id) {
      try {
        await deleteProject(project._id);
        toast.success("Project deleted successfully!");
        navigate("/admin/manageproject");
      } catch {
        toast.error("Failed to delete project");
      } finally {
        setConfirmDialogOpen(false);
      }
    }
  };

  return (
    <Layout>
      <button
        className="mt-2 ml-2 relative py-2 px-8 text-black text-base font-bold nded-full overflow-hidden bg-white rounded-full transition-all duration-400 ease-in-out shadow-md hover:scale-105 hover:text-white hover:shadow-lg active:scale-90 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-gray-500 before:to-gray-300 before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-full hover:before:left-0"
        onClick={() => navigate("/admin/manageproject")}
        aria-label="Back to project list"
      >
        <ArrowBackIcon />
      </button>
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardHeader
            title={
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h5">{project.project_name}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    ({new Date(project.project_start_date).toLocaleDateString()}{" "}
                    - {new Date(project.project_end_date).toLocaleDateString()})
                  </Typography>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-300/75 rounded-xl">
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
                  <Select
                    value={project.project_status}
                    onChange={(e) => handleOpenStatusDialog(e.target.value)}
                    className={`rounded-full text-xl font-bold ${
                      project.project_status === "New"
                        ? "text-white"
                        : project.project_status === "Active"
                        ? "text-green-400"
                        : project.project_status === "Pending"
                        ? "text-yellow-400"
                        : project.project_status === "Closed"
                        ? "text-red-400"
                        : "text-white"
                    }`}
                    variant="standard"
                    sx={{
                      "&:before": { borderBottom: "none" },
                      "&:after": { borderBottom: "none" },
                      "& .MuiSelect-select": {
                        paddingY: "8px",
                        paddingX: "16px",
                      },
                    }}
                  >
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </div>
              </div>
            }
            className="bg-gray-100 px-6 py-4"
          />
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p>
                <strong>Department:</strong> {project.project_department}
              </p>
              <p>
                <strong>Project code: </strong> {project.project_code}
              </p>
            </div>

            <p className="mt-4">
              <strong>Description:</strong> {project.project_description}
            </p>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Members</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {project.project_members &&
                project.project_members.length > 0 ? (
                  project.project_members.map((member) => (
                    <div
                      key={member._id}
                      className="bg-gray-50 p-4 rounded-lg shadow-sm border"
                    >
                      <p className="font-medium text-gray-900">
                        {member.user_name}
                      </p>
                      <p className="text-gray-600">
                        Role: {member.project_role}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    Không có thành viên trong dự án
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardActions className="p-6 flex justify-end gap-3">
            <Button
              variant="contained"
              sx={{
                backgroundColor: "gray",
                color: "white",
                "&:hover": { backgroundColor: "darkgray" },
              }}
              startIcon={loading ? null : <EditIcon />}
              onClick={handleOpenEditDialog}
              disabled={loading}
            >
              {loading ? (
                <div>
                  <span className="animate-[ping_1.5s_0.5s_ease-in-out_infinite]">
                    .
                  </span>
                  <span className="animate-[ping_1.5s_0.7s_ease-in-out_infinite]">
                    .
                  </span>
                  <span className="animate-[ping_1.5s_0.9s_ease-in-out_infinite]">
                    .
                  </span>
                </div>
              ) : (
                "Edit"
              )}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleOpenConfirmDialog}
            >
              Delete
            </Button>
          </CardActions>
        </Card>
      </div>
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this project?</Typography>
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
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        classes={{ paper: "rounded-lg" }}
      >
        <DialogTitle className="bg-gray-500 border-b border-gray-200 py-4">
          <h2 className="text-xl font-semibold text-gray-50">Edit Project</h2>
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
                  Department
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
              <Typography variant="h6" className="text-gray-700 font-semibold">
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
                            : users.find(
                                (u) =>
                                  u._id === member.user_id ||
                                  u._id === member._id
                              )?.user_name ||
                              member.user_name ||
                              ""
                        }
                        onChange={(e) =>
                          handleUserSearch(index, e.target.value)
                        }
                        onFocus={() => setShowUserDropdown(index)}
                        className="bg-white rounded-md"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Search size={20} />
                            </InputAdornment>
                          ),
                        }}
                      />
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
                                  onClick={() => handleSelectUser(index, user)}
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
                    error={
                      !!(
                        formik.touched.project_members?.[index] &&
                        formik.errors.project_members?.[index] &&
                        typeof formik.errors.project_members[index] ===
                          "object" &&
                        "project_role" in
                          (formik.errors.project_members[index] as any)
                      )
                    }
                    className="bg-white rounded-md"
                  >
                    <InputLabel
                      shrink
                      id={`role-select-label-${index}`}
                      className="bg-white px-1 text-gray-600"
                    >
                      Role *
                    </InputLabel>
                    <select
                      value={member.project_role || ""}
                      onChange={(e) =>
                        handleMemberChange(
                          index,
                          "project_role",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      aria-label={`Select role for member ${index + 1}`}
                    >
                      <option value="">Select Role</option>
                      {roleOptions.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {formik.touched.project_members?.[index] &&
                      formik.errors.project_members?.[index] &&
                      typeof formik.errors.project_members[index] ===
                        "object" &&
                      "project_role" in
                        (formik.errors.project_members[index] as any) && (
                        <p className="text-red-500 text-xs mt-1">
                          {
                            (formik.errors.project_members[index] as any)
                              .project_role
                          }
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
            onClick={() => setEditDialogOpen(false)}
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
            disabled={loading}
            sx={{
              color: "white",
              backgroundColor: "gray",
              "&:hover": { backgroundColor: "darkgray" },
            }}
            className="text-white px-6 py-2 rounded-md"
          >
            {loading ? (
              <div className="flex justify-center flex-row gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce"></div>
                <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce [animation-delay:-.5s]"></div>
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
      >
        <DialogTitle>Change Project Status</DialogTitle>
        <DialogContent>
          <div className="mt-4 space-y-4">
            <Typography>
              Are you sure you want to change the project status to{" "}
              <strong>{newStatus}</strong>?
            </Typography>
            <TextField
              fullWidth
              label="Comment (Optional)"
              multiline
              rows={3}
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              className="mt-4"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setStatusDialogOpen(false)}
            sx={{ color: "gray" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusChange}
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
    </Layout>
  );
};

export default ProjectDetail;
