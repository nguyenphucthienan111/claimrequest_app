import { useState, useEffect, useCallback } from "react";
import {
  Button,
  TextField,
  FormControl,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import { debounce } from "lodash";
import "./RequestPage.css";
import moment from "moment";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import Layout from "../../../../shared/layouts/Layout";
import CloseIcon from "@mui/icons-material/Close";
import TablePagination from "@mui/material/TablePagination";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TableChart, PictureAsPdf } from "@mui/icons-material";

const API_URL = "https://management-claim-request.vercel.app/api";

const tableCellStyle = {
  borderRight: "2px solid rgba(224, 224, 224, 1)",
  borderBottom: "2px solid rgba(224, 224, 224, 1)",
  "&:last-child": {
    borderRight: "none",
  },
};

const headerCellStyle = {
  ...tableCellStyle,
  borderBottom: "2px solid rgba(180, 180, 180, 1)",
  backgroundColor: "#f3f4f6",
  fontWeight: "bold",
};

interface Request {
  _id: string;
  staff_id: string;
  staff_name: string;
  staff_email: string;
  project_id: string;
  approval_id: string;
  claim_name: string;
  claim_status: string;
  claim_start_date: string;
  claim_end_date: string;
  total_work_time: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  project_info?: {
    _id: string;
    project_name: string;
    project_code: string;
  };
  approval_info?: {
    _id: string;
    user_name: string;
    email: string;
  };
}

interface Project {
  _id: string;
  project_name: string;
  project_code: string;
  project_department: string;
  project_description: string;
  project_status: string;
  project_start_date: string;
  project_end_date: string;
  project_members: {
    project_role: string;
    user_id: string;
    employee_id: string;
    user_name: string;
    full_name: string;
  }[];
}

interface Approver {
  _id: string;
  user_name: string;
  email: string;
}

interface ClaimLog {
  _id: string;
  claim_id: string;
  old_status: string;
  new_status: string;
  updated_by: string;
  updated_at: string;
  comment: string;
}

interface FormValues {
  claim_name: string;
  project_id: string;
  approval_id: string;
  claim_start_date: moment.Moment | null;
  claim_end_date: moment.Moment | null;
  total_work_time: number;
}

const RequestPage = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [claimLogs, setClaimLogs] = useState<ClaimLog[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>("All");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLogModalVisible, setIsLogModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedApproverName, setSelectedApproverName] = useState<string>("");
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequestForDownload, setSelectedRequestForDownload] = useState<Request | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    clearErrors,
  } = useForm<FormValues>({
    defaultValues: {
      claim_name: "",
      project_id: "",
      approval_id: "",
      claim_start_date: null,
      claim_end_date: null,
      total_work_time: 0,
    },
    mode: "onChange",
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const tokenParts = storedToken.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log("Token payload:", payload);
        if (payload.id) {
          setUserId(payload.id);
          localStorage.setItem("userId", payload.id);
          console.log("Set userId from token:", payload.id);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.error("No token found in localStorage");
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUserEmail = localStorage.getItem("userEmail");
        if (currentUserEmail) {
          setUserEmail(currentUserEmail);
          const response = await axios.get(`${API_URL}/users/${currentUserEmail}`);
          setUserId(response.data.data._id);
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
      }
    };
    fetchUser();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/claims/claimer-search`,
        {
          searchCondition: {
            keyword: search,
            claim_status: selectedStatus === "All" ? "" : selectedStatus,
            claim_start_date: "",
            claim_end_date: "",
            is_delete: false,
          },
          pageInfo: {
            pageNum: page + 1,
            pageSize: rowsPerPage,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setRequests(response.data.data.pageData);
        setTotalCount(response.data.data.pageInfo.totalItems);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && token) {
      fetchRequests();
    }
  }, [userEmail, userId, token, page, rowsPerPage, search, selectedStatus]);

  const fetchProjects = async (keyword: string = "") => {
    try {
      console.log("Fetching projects for userId:", userId);
      const projectsResponse = await axios.post(
        `${API_URL}/projects/search`,
        {
          searchCondition: {
            keyword: keyword,
            project_start_date: "",
            project_end_date: "",
            is_delete: false,
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 100,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (projectsResponse.data.success) {
        const allProjects = projectsResponse.data.data.pageData;
        console.log("All projects:", allProjects);

        const userProjects = allProjects.filter((project: Project) => {
          const isMember = project.project_members?.some(
            (member) => member.user_id === userId
          );
          console.log(
            `Project ${project.project_name} - User is member: ${isMember}`
          );
          return isMember;
        });

        console.log("Filtered user projects:", userProjects);
        setProjects(userProjects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const debouncedFetchProjects = useCallback(debounce(fetchProjects, 800), [token, userId]);

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [token, userId]);

  useEffect(() => {
    const storedRequests = localStorage.getItem("requests");
    if (storedRequests) {
      setRequests(JSON.parse(storedRequests));
    }
  }, []);

  useEffect(() => {
    if (requests.length > 0) {
      localStorage.setItem("requests", JSON.stringify(requests));
    }
  }, [requests]);

  const fetchApprovers = async (keyword: string) => {
    try {
      console.log("Fetching approvers...");
      const response = await axios.post(
        `${API_URL}/users/search`,
        {
          searchCondition: {
            keyword,
            role_code: "A003",
            is_delete: false,
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 100,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Approvers response received:", response.data);
      if (response.data.success) {
        setApprovers(response.data.data.pageData);
        console.log("Approvers set:", response.data.data.pageData);
      } else {
        console.error("Failed to fetch approvers:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching approvers:", error);
    }
  };

  const fetchClaimLogs = async (claimId: string) => {
    try {
      console.log("Fetching logs for claimId:", claimId);
      const response = await axios.post(
        `${API_URL}/claim-logs/search`,
        {
          searchCondition: {
            claim_id: claimId,
            is_deleted: false,
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 100,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API response:", response.data);
      if (response.data.success) {
        console.log("Fetched claim logs:", response.data.data.pageData);
        setClaimLogs(response.data.data.pageData);
      } else {
        console.error("Failed to fetch claim logs:", response.data.message);
        setClaimLogs([]);
      }
    } catch (error) {
      console.error("Error fetching claim logs:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error details:", error.response?.data);
      }
      setClaimLogs([]);
    }
  };

  const debouncedFetchApprovers = useCallback(debounce(fetchApprovers, 800), [token]);

  const ensureProjectsFetched = async () => {
    if (projects.length === 0 && userId) {
      await fetchProjects();
    }
  };

  const ensureApproversFetched = async () => {
    if (approvers.length === 0) {
      await fetchApprovers("");
    }
  };

  const handleAddModalOk = async (data: FormValues) => {
    if (!userId || !token) {
      console.error("Missing userId or token");
      return;
    }

    try {
      const newRequest = {
        user_id: userId,
        project_id: data.project_id,
        approval_id: data.approval_id,
        claim_name: data.claim_name,
        claim_start_date: data.claim_start_date?.toISOString(),
        claim_end_date: data.claim_end_date?.toISOString(),
        total_work_time: Number(data.total_work_time),
        claim_status: "Draft",
        remark: "",
      };

      console.log("Submitting newRequest:", newRequest);

      const response = await axios.post(`${API_URL}/claims`, newRequest, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("API response:", response.data);

      if (response.data.success) {
        const updatedRequests = [...requests, response.data.data];
        setRequests(updatedRequests);
        localStorage.setItem("requests", JSON.stringify(updatedRequests));
        setIsAddModalVisible(false);
        reset();
        setSelectedApproverName("");
        setSelectedProjectName("");
        toast.success("Request added successfully!", {
          icon: "✅",
        });
      } else {
        console.error("Failed to add request:", response.data.message);
        toast(response.data.message, {
          icon: "❌",
        });
      }
    } catch (error) {
      console.error("Error adding request:", error);
      toast.error("Failed to add request");
    }
  };

  const handleEditModalOk = async (data: FormValues) => {
    if (!currentRequest || !token) {
      console.error("Missing currentRequest or token");
      return;
    }

    try {
      const updatedRequest = {
        _id: currentRequest._id,
        user_id: userId,
        project_id: data.project_id,
        approval_id: data.approval_id,
        claim_name: data.claim_name,
        claim_start_date: data.claim_start_date?.toISOString(),
        claim_end_date: data.claim_end_date?.toISOString(),
        total_work_time: Number(data.total_work_time),
        claim_status: currentRequest.claim_status,
      };

      console.log("Submitting updated request:", updatedRequest);

      const response = await axios.put(
        `${API_URL}/claims/${currentRequest._id}`,
        updatedRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setRequests(
          requests.map((req) =>
            req._id === currentRequest._id
              ? {
                  ...req,
                  ...updatedRequest,
                  claim_start_date: updatedRequest.claim_start_date!,
                  claim_end_date: updatedRequest.claim_end_date!,
                  project_info: projects.find((p) => p._id === data.project_id) || req.project_info,
                  approval_info: approvers.find((a) => a._id === data.approval_id) || req.approval_info,
                }
              : req
          )
        );
        setIsEditModalVisible(false);
        setCurrentRequest(null);
        reset();
        toast.success("Request updated successfully!", {
          icon: "✅",
        });
      } else {
        console.error("Failed to update request:", response.data.message);
        toast(`Failed to update request: ${response.data.message}`, {
          icon: "❌",
        });
      }
    } catch (error) {
      console.error("Error editing request:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast(`Error: ${error.response.data.message || "Failed to update request"}`, {
          icon: "❌",
        });
      } else {
        toast("An unexpected error occurred. Please try again.", {
          icon: "❌",
        });
      }
    }
  };

  const handleEditClick = async (req: Request) => {
    await Promise.all([ensureProjectsFetched(), ensureApproversFetched()]);
    
    const projectName = req.project_info?.project_name || "";
    const approverName = req.approval_info?.user_name || "";
    const projectId = req.project_id || "";
    const approvalId = req.approval_id || "";

    setValue("claim_name", req.claim_name);
    setValue("project_id", projectId);
    setValue("approval_id", approvalId);
    setValue("claim_start_date", moment(req.claim_start_date));
    setValue("claim_end_date", moment(req.claim_end_date));
    setValue("total_work_time", req.total_work_time);
    
    setSelectedProjectName(projectName);
    setSelectedApproverName(approverName);
    
    clearErrors();

    setCurrentRequest(req);
    setIsEditModalVisible(true);
  };

  const handleRequestApproval = async (id: string) => {
    setRequestToApprove(id);
    setIsConfirmModalVisible(true);
  };

  const handleConfirmApproval = async () => {
    if (requestToApprove === null || !token) return;

    try {
      const response = await axios.put(
        `${API_URL}/claims/change-status`,
        {
          _id: requestToApprove,
          claim_status: "Pending Approval",
          comment: "Submitted for approval by user", // Thêm comment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setRequests(
          requests.map((req) =>
            req._id === requestToApprove
              ? { ...req, claim_status: "Pending Approval" }
              : req
          )
        );
        setIsConfirmModalVisible(false);
        setRequestToApprove(null);
        toast.success("Request has been submitted for approval!", {
          icon: "✅",
        });

        // Cập nhật logs nếu View Logs đang mở cho claim này
        if (selectedClaimId === requestToApprove) {
          await fetchClaimLogs(requestToApprove);
        }
      } else {
        console.error("Failed to update status:", response.data.message);
        toast(`Failed to submit request: ${response.data.message}`, {
          icon: "❌",
        });
      }
    } catch (error) {
      console.error("Error sending approval request:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast(`Error: ${error.response.data.message || "Failed to update status"}`, {
          icon: "❌",
        });
      } else {
        toast("An unexpected error occurred. Please try again.", {
          icon: "❌",
        });
      }
    }
  };

  const handleViewLogs = (claimId: string) => {
    console.log("Viewing logs for claimId:", claimId);
    setSelectedClaimId(claimId);
    fetchClaimLogs(claimId);
    setIsLogModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsAddModalVisible(false);
    setIsEditModalVisible(false);
    setIsDeleteModalVisible(false);
    setIsLogModalVisible(false);
    setCurrentRequest(null);
    
    reset();
    clearErrors();
    setSelectedApproverName("");
    setSelectedProjectName("");
  };

  const handleRequestCancel = async (id: string) => {
    setRequestToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (requestToDelete === null || !token) return;

    try {
      const response = await axios.put(
        `${API_URL}/claims/change-status`,
        {
          _id: requestToDelete,
          claim_status: "Canceled",
          comment: "Canceled by user",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setRequests(
          requests.map((req) =>
            req._id === requestToDelete
              ? { ...req, claim_status: "Canceled" }
              : req
          )
        );
        setIsDeleteModalVisible(false);
        setRequestToDelete(null);
        toast("Request has been canceled!", {
          icon: "✅",
        });

        // Cập nhật logs nếu View Logs đang mở cho claim này
        if (selectedClaimId === requestToDelete) {
          await fetchClaimLogs(requestToDelete);
        }
      } else {
        console.error("Failed to cancel request:", response.data.message);
        toast(`Failed to cancel request: ${response.data.message}`, {
          icon: "❌",
        });
      }
    } catch (error) {
      console.error("Error canceling request:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast(`Error: ${error.response.data.message || "Failed to cancel request"}`, {
          icon: "❌",
        });
      } else {
        toast("An unexpected error occurred. Please try again.", {
          icon: "❌",
        });
      }
    }
  };

  const handleDownloadClick = (event: React.MouseEvent<HTMLElement>, request: Request) => {
    setDownloadAnchorEl(event.currentTarget);
    setSelectedRequestForDownload(request);
  };

  const handleDownloadClose = () => {
    setDownloadAnchorEl(null);
    setSelectedRequestForDownload(null);
  };

  const handleDownloadExcel = () => {
    if (!selectedRequestForDownload) return;

    const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
    const fileName = `request-${selectedRequestForDownload.claim_name}_${timestamp}.xlsx`;

    const data = [
      {
        "Request Name": selectedRequestForDownload.claim_name,
        Project: selectedRequestForDownload.project_info
          ? `${selectedRequestForDownload.project_info.project_name} (${selectedRequestForDownload.project_info.project_code})`
          : "N/A",
        Approver: selectedRequestForDownload.approval_info?.user_name || "N/A",
        "Start Date": moment(selectedRequestForDownload.claim_start_date).format("DD/MM/YYYY"),
        "End Date": moment(selectedRequestForDownload.claim_end_date).format("DD/MM/YYYY"),
        "Total Hours": `${selectedRequestForDownload.total_work_time} hours`,
        Status: selectedRequestForDownload.claim_status,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Request Details");
    XLSX.writeFile(wb, fileName);

    handleDownloadClose();
  };

  const handleDownloadPDF = () => {
    if (!selectedRequestForDownload) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    doc.setFontSize(20);
    doc.text("Request Details", doc.internal.pageSize.getWidth() / 2, 40, {
      align: "center",
    });

    const tableData = {
      head: [["Request Name", "Project", "Approver", "Start Date", "End Date", "Total Hours", "Status"]],
      body: [
        [
          selectedRequestForDownload.claim_name,
          selectedRequestForDownload.project_info
            ? `${selectedRequestForDownload.project_info.project_name} (${selectedRequestForDownload.project_info.project_code})`
            : "N/A",
          selectedRequestForDownload.approval_info?.user_name || "N/A",
          moment(selectedRequestForDownload.claim_start_date).format("DD/MM/YYYY"),
          moment(selectedRequestForDownload.claim_end_date).format("DD/MM/YYYY"),
          `${selectedRequestForDownload.total_work_time} hours`,
          selectedRequestForDownload.claim_status,
        ],
      ],
    };

    autoTable(doc, {
      startY: 60,
      head: tableData.head,
      body: tableData.body,
      theme: "grid",
      headStyles: {
        fillColor: [128, 128, 128],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        fontSize: 11,
        halign: "center",
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 180 },
        2: { cellWidth: 100 },
        3: { cellWidth: 80 },
        4: { cellWidth: 80 },
        5: { cellWidth: 80 },
        6: { cellWidth: 80 },
      },
      margin: { top: 60, right: 30, bottom: 30, left: 30 },
    });

    const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
    const fileName = `request-${selectedRequestForDownload.claim_name}_${timestamp}.pdf`;

    doc.save(fileName);
    handleDownloadClose();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        <div className="p-8">
          <div className="request-content">
            <h1 className="request-title">Claim Request Management</h1>

            <div className="request-filters" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-field"
                  placeholder="Search by name..."
                  sx={{ width: "1000px" }}
                />
                <Autocomplete
                  options={["All", "Draft", "Pending Approval", "Rejected", "Approved","Canceled"]}
                  value={selectedStatus || "All"}
                  onChange={(_, newValue) => {
                    setSelectedStatus(newValue || "All");
                    setPage(0); // Reset page to 0 when changing status
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Status"
                      variant="outlined"
                      size="small"
                      placeholder="Filter by status"
                    />
                  )}
                  sx={{ minWidth: "200px" }}
                />
              </div>
              <Button
                variant="contained"
                onClick={() => setIsAddModalVisible(true)}
                sx={{
                  backgroundColor: "#CBE82A",
                  "&:hover": {
                    backgroundColor: "#81eee8",
                  },
                }}
              >
                + Add Request
              </Button>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="flex justify-center flex-row gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce [animation-delay:-.5s]"></div>
                </div>
              </div>
            ) : (
              <TableContainer component={Paper} className="request-table-container">
                <Table stickyHeader aria-label="requests table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={headerCellStyle}>
                        Request Name
                      </TableCell>
                      <TableCell align="center" sx={headerCellStyle}>
                        Project Name
                      </TableCell>
                      <TableCell align="center" sx={headerCellStyle}>
                        Approver
                      </TableCell>
                      <TableCell align="center" sx={headerCellStyle}>
                        Status
                      </TableCell>
                      <TableCell align="center" sx={headerCellStyle}>
                        Start Date
                      </TableCell>
                      <TableCell align="center" sx={headerCellStyle}>
                        End Date
                      </TableCell>
                      <TableCell align="center" sx={headerCellStyle}>
                        Total Times (Hours)
                      </TableCell>
                      <TableCell align="center" sx={headerCellStyle}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req._id}>
                        <TableCell align="center" sx={tableCellStyle}>
                          {req.claim_name}
                        </TableCell>
                        <TableCell align="center" sx={tableCellStyle}>
                          {req.project_info?.project_name || "Unknown Project"}
                        </TableCell>
                        <TableCell align="center" sx={tableCellStyle}>
                          {req.approval_info?.user_name || "Unknown Approver"}
                        </TableCell>
                        <TableCell align="center" sx={tableCellStyle}>
                          <span
                            className={`status-badge status-${req.claim_status
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {req.claim_status}
                          </span>
                        </TableCell>
                        <TableCell align="center" sx={tableCellStyle}>
                          {moment(req.claim_start_date).format("DD/MM/YYYY")}
                        </TableCell>
                        <TableCell align="center" sx={tableCellStyle}>
                          {moment(req.claim_end_date).format("DD/MM/YYYY")}
                        </TableCell>
                        <TableCell align="center" sx={tableCellStyle}>
                          {req.total_work_time} (hours)
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ ...tableCellStyle, minWidth: "300px" }}
                        >
                          <div className="action-buttons">
                            {(req.claim_status === "Draft" || req.claim_status === "Returned") && (
                              <>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleEditClick(req)}
                                  sx={{
                                    backgroundColor: "#e6cb62",
                                    color: "black",
                                    "&:hover": {
                                      backgroundColor: "#eab308",
                                      color: "white",
                                    },
                                    mr: 1,
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleRequestCancel(req._id)}
                                  sx={{
                                    backgroundColor: "#dc2626",
                                    color: "white",
                                    "&:hover": {
                                      backgroundColor: "#ef4444",
                                    },
                                    mr: 1,
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleRequestApproval(req._id)}
                                  sx={{
                                    backgroundColor: "#46d179",
                                    color: "white",
                                    "&:hover": {
                                      backgroundColor: "#16a34a",
                                    },
                                    mr: 1,
                                  }}
                                >
                                  Request Approval
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewLogs(req._id)}
                              sx={{
                                borderColor: "#6b7280",
                                color: "#6b7280",
                                "&:hover": {
                                  borderColor: "#374151",
                                  color: "#374151",
                                },
                              }}
                            >
                              View Logs
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={(e) => handleDownloadClick(e, req)}
                              sx={{
                                backgroundColor: "#3b82f6",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "#2563eb",
                                },
                                mr: 1,
                              }}
                            >
                              Download
                            </Button>
<Menu
                              anchorEl={downloadAnchorEl}
                              open={Boolean(downloadAnchorEl)}
                              onClose={handleDownloadClose}
                            >
                              <MenuItem onClick={handleDownloadExcel}>
                                <ListItemIcon>
                                  <TableChart fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Download Excel</ListItemText>
                              </MenuItem>
                              <MenuItem onClick={handleDownloadPDF}>
                                <ListItemIcon>
                                  <PictureAsPdf fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Download PDF</ListItemText>
                              </MenuItem>
                            </Menu>
<Menu
                              anchorEl={downloadAnchorEl}
                              open={Boolean(downloadAnchorEl)}
                              onClose={handleDownloadClose}
                            >
                              <MenuItem onClick={handleDownloadExcel}>
                                <ListItemIcon>
                                  <TableChart fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Download Excel</ListItemText>
                              </MenuItem>
                              <MenuItem onClick={handleDownloadPDF}>
                                <ListItemIcon>
                                  <PictureAsPdf fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Download PDF</ListItemText>
                              </MenuItem>
                            </Menu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                  labelDisplayedRows={({ from, to, count }) => {
                    return `${from}-${to} of ${count}`;
                  }}
                  showFirstButton
                  showLastButton
                />
              </TableContainer>
            )}
          </div>

          {/* Add Request Modal */}
          <Dialog
            open={isAddModalVisible}
            onClose={handleModalCancel}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle
              sx={{
                m: 0,
                p: 2,
                fontSize: "1.25rem",
                position: "relative",
                backgroundColor: "#f3f4f6",
              }}
            >
              Add Request
              <IconButton
                aria-label="close"
                onClick={handleModalCancel}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <form onSubmit={handleSubmit(handleAddModalOk)}>
                <Controller
                  name="claim_name"
                  control={control}
                  rules={{ required: "Claim name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Request Name *"
                      fullWidth
                      margin="normal"
                      error={!!errors.claim_name}
                      helperText={errors.claim_name?.message}
                    />
                  )}
                />
                <Controller
                  name="project_id"
                  control={control}
                  rules={{ required: "Project is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal" error={!!errors.project_id}>
                      <Autocomplete
                        freeSolo
                        options={projects.map((project) => project.project_name)}
                        value={selectedProjectName || ""}
                        onInputChange={(_, newInputValue) => {
                          setSelectedProjectName(newInputValue);
                          debouncedFetchProjects(newInputValue);
                          const selectedProject = projects.find(
                            (project) => project.project_name === newInputValue
                          );
                          field.onChange(selectedProject?._id || "");
                        }}
                        onChange={(_, newValue) => {
                          const selectedProject = projects.find(
                            (project) => project.project_name === newValue
                          );
                          field.onChange(selectedProject?._id || "");
                          setSelectedProjectName(newValue || "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Project Name *"
                            error={!!errors.project_id}
                            helperText={errors.project_id?.message}
                            onChange={(e) => {
                              debouncedFetchProjects(e.target.value);
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  )}
                />
                <Controller
                  name="approval_id"
                  control={control}
                  rules={{ required: "Approver is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal" error={!!errors.approval_id}>
                      <Autocomplete
                        freeSolo
                        options={approvers.map((approver) => approver.user_name)}
                        value={selectedApproverName}
                        onInputChange={(_, newInputValue) => {
                          setSelectedApproverName(newInputValue);
                          debouncedFetchApprovers(newInputValue);
                          const selectedApprover = approvers.find(
                            (approver) => approver.user_name === newInputValue
                          );
                          field.onChange(selectedApprover?._id || "");
                        }}
                        onChange={(_, newValue) => {
                          const selectedApprover = approvers.find(
                            (approver) => approver.user_name === newValue
                          );
                          field.onChange(selectedApprover?._id || "");
                          setSelectedApproverName(newValue || "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Approver *"
                            error={!!errors.approval_id}
                            helperText={errors.approval_id?.message}
                          />
                        )}
                      />
                    </FormControl>
                  )}
                />
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                    <Controller
                      name="claim_start_date"
                      control={control}
                      rules={{
                        required: "Start date is required",
                        validate: (value) => {
                          const selectedProject = projects.find((p) => p._id === watch("project_id"));
                          if (!selectedProject) return "Please select a project first";
                          const projectStart = moment(selectedProject.project_start_date);
                          const projectEnd = moment(selectedProject.project_end_date);
                          if (value && value.isBefore(projectStart, "day")) {
                            return "Start date cannot be before project start date";
                          }
                          if (value && value.isAfter(projectEnd, "day")) {
                            return "Start date cannot be after project end date";
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <DatePicker
                          label="Start Date *"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.claim_start_date,
                              helperText: errors.claim_start_date?.message,
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="claim_end_date"
                      control={control}
                      rules={{
                        required: "End date is required",
                        validate: (value) => {
                          const selectedProject = projects.find((p) => p._id === watch("project_id"));
                          if (!selectedProject) return "Please select a project first";
                          const projectEnd = moment(selectedProject.project_end_date);
                          const projectStart = moment(selectedProject.project_start_date);
                          const startDate = watch("claim_start_date");
                          if (value && startDate && value.isBefore(startDate)) {
                            return "End date cannot be before start date";
                          }
                          if (value && value.isAfter(projectEnd)) {
                            return "End date cannot be after project end date";
                          }
                          if (value && value.isBefore(projectStart)) {
                            return "End date cannot be before project start date";
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <DatePicker
                          label="End Date *"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.claim_end_date,
                              helperText: errors.claim_end_date?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </div>
                </LocalizationProvider>
                <Controller
                  name="total_work_time"
                  control={control}
                  rules={{
                    required: "Total work time is required",
                    min: { value: 1, message: "Total work time must be positive" },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Total Times *"
                      type="number"
                      fullWidth
                      margin="normal"
                      error={!!errors.total_work_time}
                      helperText={errors.total_work_time?.message}
                    />
                  )}
                />
                <DialogActions sx={{ p: 0, mt: 3 }}>
                  <Button onClick={handleModalCancel} variant="outlined">
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    Add
                  </Button>
                </DialogActions>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Request Modal */}
          <Dialog
            open={isEditModalVisible}
            onClose={handleModalCancel}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle
              sx={{
                m: 0,
                p: 2,
                fontSize: "1.25rem",
                position: "relative",
                backgroundColor: "#f3f4f6",
              }}
            >
              Edit Request
              <IconButton
                aria-label="close"
                onClick={handleModalCancel}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <form onSubmit={handleSubmit(handleEditModalOk)}>
                <Controller
                  name="claim_name"
                  control={control}
                  rules={{ required: "Claim name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Request Name *"
                      fullWidth
                      margin="normal"
                      error={!!errors.claim_name}
                      helperText={errors.claim_name?.message}
                    />
                  )}
                />
                <Controller
                  name="project_id"
                  control={control}
                  rules={{ required: "Project is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal">
                      <Autocomplete
                        freeSolo
                        options={projects.map((project) => project.project_name)}
                        value={selectedProjectName || ""}
                        onInputChange={(_, newInputValue) => {
                          setSelectedProjectName(newInputValue);
                          debouncedFetchProjects(newInputValue);
                          const selectedProject = projects.find(
                            (project) => project.project_name === newInputValue
                          );
                          field.onChange(selectedProject?._id || "");
                        }}
                        onChange={(_, newValue) => {
                          const selectedProject = projects.find(
                            (project) => project.project_name === newValue
                          );
                          field.onChange(selectedProject?._id || "");
                          setSelectedProjectName(newValue || "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Project Name *"
                            error={!!errors.project_id}
                            helperText={errors.project_id?.message}
                            onChange={(e) => {
                              debouncedFetchProjects(e.target.value);
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  )}
                />
                <Controller
                  name="approval_id"
                  control={control}
                  rules={{ required: "Approver is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal">
                      <Autocomplete
                        freeSolo
                        options={approvers.map((approver) => approver.user_name)}
                        value={selectedApproverName || ""}
                        onInputChange={(_, newInputValue) => {
                          setSelectedApproverName(newInputValue);
                          debouncedFetchApprovers(newInputValue);
                          const selectedApprover = approvers.find(
                            (approver) => approver.user_name === newInputValue
                          );
                          field.onChange(selectedApprover?._id || "");
                        }}
                        onChange={(_, newValue) => {
                          const selectedApprover = approvers.find(
                            (approver) => approver.user_name === newValue
                          );
                          field.onChange(selectedApprover?._id || "");
                          setSelectedApproverName(newValue || "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Approver *"
                            error={!!errors.approval_id}
                            helperText={errors.approval_id?.message}
                          />
                        )}
                      />
                    </FormControl>
                  )}
                />
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                    <Controller
                      name="claim_start_date"
                      control={control}
                      rules={{
                        required: "Start date is required",
                        validate: (value) => {
                          const selectedProject = projects.find((p) => p._id === watch("project_id"));
                          if (!selectedProject) return "Please select a project first";
                          const projectStart = moment(selectedProject.project_start_date);
                          const projectEnd = moment(selectedProject.project_end_date);
                          if (value && value.isBefore(projectStart, "day")) {
                            return "Start date cannot be before project start date";
                          }
                          if (value && value.isAfter(projectEnd, "day")) {
                            return "Start date cannot be after project end date";
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <DatePicker
                          label="Start Date *"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.claim_start_date,
                              helperText: errors.claim_start_date?.message,
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="claim_end_date"
                      control={control}
                      rules={{
                        required: "End date is required",
                        validate: (value) => {
                          const selectedProject = projects.find((p) => p._id === watch("project_id"));
                          if (!selectedProject) return "Please select a project first";
                          const projectEnd = moment(selectedProject.project_end_date);
                          const projectStart = moment(selectedProject.project_start_date);
                          const startDate = watch("claim_start_date");
                          if (value && startDate && value.isBefore(startDate)) {
                            return "End date cannot be before start date";
                          }
                          if (value && value.isAfter(projectEnd)) {
                            return "End date cannot be after project end date";
                          }
                          if (value && value.isBefore(projectStart)) {
                            return "End date cannot be before project start date";
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <DatePicker
                          label="End Date *"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.claim_end_date,
                              helperText: errors.claim_end_date?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </div>
                </LocalizationProvider>
                <Controller
                  name="total_work_time"
                  control={control}
                  rules={{
                    required: "Total work time is required",
                    min: { value: 1, message: "Total work time must be positive" },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Total Times *"
                      type="number"
                      fullWidth
                      margin="normal"
                      error={!!errors.total_work_time}
                      helperText={errors.total_work_time?.message}
                    />
                  )}
                />
                <DialogActions sx={{ p: 0, mt: 3 }}>
                  <Button onClick={handleModalCancel} variant="outlined">
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    Save Changes
                  </Button>
                </DialogActions>
              </form>
            </DialogContent>
          </Dialog>

          {/* Confirm Approval Modal */}
          <Dialog
            open={isConfirmModalVisible}
            onClose={() => setIsConfirmModalVisible(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle
              sx={{
                m: 0,
                p: 2,
                fontSize: "1.25rem",
                position: "relative",
                backgroundColor: "#f3f4f6",
              }}
            >
              Confirm Approval Request
              <IconButton
                aria-label="close"
                onClick={() => setIsConfirmModalVisible(false)}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <p style={{ marginTop: "16px", fontSize: "1rem" }}>
                Are you sure you want to submit this request for approval?
              </p>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setIsConfirmModalVisible(false)}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmApproval}
                variant="contained"
                color="primary"
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <Dialog
            open={isDeleteModalVisible}
            onClose={() => setIsDeleteModalVisible(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle
              sx={{
                m: 0,
                p: 2,
                fontSize: "1.25rem",
                position: "relative",
                backgroundColor: "#f3f4f6",
              }}
            >
              Confirm Cancel
              <IconButton
                aria-label="close"
                onClick={() => setIsDeleteModalVisible(false)}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <p style={{ marginTop: "16px", fontSize: "1rem" }}>
                Are you sure you want to cancel this request?
              </p>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setIsDeleteModalVisible(false)}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCancel}
                variant="contained"
                color="error"
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          {/* Claim Logs Modal */}
          <Dialog
            open={isLogModalVisible}
            onClose={() => setIsLogModalVisible(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle
              sx={{
                m: 0,
                p: 2,
                fontSize: "1.25rem",
                position: "relative",
                backgroundColor: "#f3f4f6",
              }}
            >
              Claim Logs
              <IconButton
                aria-label="close"
                onClick={() => setIsLogModalVisible(false)}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {claimLogs.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table aria-label="claim logs table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" sx={headerCellStyle}>
                          Updated At
                        </TableCell>
                        <TableCell align="center" sx={headerCellStyle}>
                          Status Before
                        </TableCell>
                        <TableCell align="center" sx={headerCellStyle}>
                          Status After
                        </TableCell>
                        <TableCell align="center" sx={headerCellStyle}>
                          Updated By
                        </TableCell>
                        <TableCell align="center" sx={headerCellStyle}>
                          Comment
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {claimLogs
                        .sort((a, b) => moment(a.updated_at).diff(moment(b.updated_at)))
                        .map((log) => (
                          <TableRow key={log._id}>
                            <TableCell align="center" sx={tableCellStyle}>
                              {moment(log.updated_at).format("DD/MM/YYYY HH:mm:ss")}
                            </TableCell>
                            <TableCell align="center" sx={tableCellStyle}>
                              {log.old_status}
                            </TableCell>
                            <TableCell align="center" sx={tableCellStyle}>
                              {log.new_status}
                            </TableCell>
                            <TableCell align="center" sx={tableCellStyle}>
                              {log.updated_by}
                            </TableCell>
                            <TableCell align="center" sx={tableCellStyle}>
                              {log.comment || "No comment provided"}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <p>No logs available for this request. This may be due to no actions taken on this claim yet.</p>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setIsLogModalVisible(false)}
                variant="outlined"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default RequestPage;