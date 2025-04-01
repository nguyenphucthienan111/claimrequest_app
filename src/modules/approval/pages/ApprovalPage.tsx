import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ApprovalPage.css";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from "@mui/material";
import moment from "moment";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Download, PictureAsPdf, TableChart } from "@mui/icons-material";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "https://management-claim-request.vercel.app/api";

interface Claim {
  _id: string;
  claim_name: string;
  claim_status: string;
  claim_start_date: string;
  claim_end_date: string;
  total_work_time: number;
  staff_name: string;
  staff_email: string;
  project_info: {
    project_name: string;
    project_code: string;
  };
  role_in_project: string;
  remark?: string;
}

const ApprovalPage: React.FC = () => {
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState("");
  const [currentClaimId, setCurrentClaimId] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<
    "Approved" | "Rejected" | "Draft" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [totalItems, setTotalItems] = useState<number>(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [downloadAllAnchorEl, setDownloadAllAnchorEl] =
    useState<null | HTMLElement>(null);
  const [selectedClaimForDownload, setSelectedClaimForDownload] =
    useState<Claim | null>(null);

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

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!token) return;
    fetchClaims();
  }, [token, debouncedSearchTerm, page, rowsPerPage]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/claims/approval-search`,
        {
          searchCondition: {
            keyword: debouncedSearchTerm || "",
            claim_status: "Pending Approval",
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
        const filteredData = response.data.data.pageData.filter(
          (claim: Claim) =>
            claim.claim_status !== "Draft" && claim.claim_status !== "Canceled"
        );

        setFilteredClaims(filteredData);
        setTotalItems(response.data.data.pageInfo.totalItems);
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleApprove = (id: string) => {
    setCurrentClaimId(id);
    setCurrentAction("Approved");
    setIsModalOpen(true);
  };

  const handleReject = (id: string) => {
    setCurrentClaimId(id);
    setCurrentAction("Rejected");
    setIsModalOpen(true);
  };

  const handleReturn = (id: string) => {
    setCurrentClaimId(id);
    setCurrentAction("Draft");
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!currentClaimId || !currentAction) return;

    // Reset modal state immediately
    setIsModalOpen(false);
    setModalReason("");
    setCurrentClaimId(null);
    setCurrentAction(null);
    setError(null);

    try {
      setLoading(true);
      const payload = {
        _id: currentClaimId,
        claim_status: currentAction,
        comment: currentAction !== "Approved" ? modalReason : "",
      };

      const response = await axios.put(
        `${API_URL}/claims/change-status`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Cập nhật UI
        setFilteredClaims((prevClaims) =>
          prevClaims.map((claim) =>
            claim._id === currentClaimId
              ? { ...claim, claim_status: currentAction }
              : claim
          )
        );

        // Hiển thị thông báo thành công
        toast.success(
          `Claim ${
            currentAction === "Approved"
              ? "approved"
              : currentAction === "Draft"
              ? "returned to draft"
              : "rejected"
          } successfully!`,
          {
            icon: "✅",
          }
        );

        // Refresh data
        fetchClaims();
      }
    } catch (error: any) {
      console.error(`Error updating claim status:`, error);
      toast(
        error.response?.data?.message ||
          "Failed to update claim status. Please try again.",
        {
          icon: "❌",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalReason("");
    setCurrentClaimId(null);
    setCurrentAction(null);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format("DD/MM/YYYY");
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDownloadClick = (
    event: React.MouseEvent<HTMLElement>,
    claim: Claim
  ) => {
    setDownloadAnchorEl(event.currentTarget);
    setSelectedClaimForDownload(claim);
  };

  const handleDownloadClose = () => {
    setDownloadAnchorEl(null);
    setSelectedClaimForDownload(null);
  };

  const handleDownloadAllClick = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAllAnchorEl(event.currentTarget);
  };

  const handleDownloadAllClose = () => {
    setDownloadAllAnchorEl(null);
  };

  const handleDownloadExcel = () => {
    try {
      setLoading(true);
      if (!selectedClaimForDownload) return;

      const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
      const fileName = `claim-${selectedClaimForDownload.claim_name}_${timestamp}.xlsx`;

      const data = [
        {
          "Claim Name": selectedClaimForDownload.claim_name,
          Project: selectedClaimForDownload.project_info
            ? `${selectedClaimForDownload.project_info.project_name} (${selectedClaimForDownload.project_info.project_code})`
            : "N/A",
          Requester: selectedClaimForDownload.staff_name,
          Role: selectedClaimForDownload.role_in_project || "N/A",
          "Start Date": formatDate(selectedClaimForDownload.claim_start_date),
          "End Date": formatDate(selectedClaimForDownload.claim_end_date),
          "Total Hours": `${selectedClaimForDownload.total_work_time} hours`,
          Status: selectedClaimForDownload.claim_status,
        },
      ];

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Claim Details");

      // Save with dialog
      XLSX.writeFile(wb, fileName, {
        bookType: "xlsx",
        bookSST: false,
        type: "file",
      });

      toast.success("Excel file downloaded successfully!", {
        icon: "✅",
      });
    } catch (error) {
      console.error("Error creating Excel:", error);
      toast("Failed to create Excel file. Please try again.", {
        icon: "❌",
      });
    } finally {
      setLoading(false);
      handleDownloadClose();
    }
  };

  const handleDownloadPDF = () => {
    try {
      setLoading(true);
      if (!selectedClaimForDownload) return;

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      doc.setFontSize(20);
      doc.text("Claim Details", doc.internal.pageSize.getWidth() / 2, 40, {
        align: "center",
      });

      const tableData = {
        head: [
          [
            "Claim Name",
            "Project",
            "Requester",
            "Role",
            "Start Date",
            "End Date",
            "Total Hours",
            "Status",
          ],
        ],
        body: [
          [
            selectedClaimForDownload.claim_name,
            selectedClaimForDownload.project_info
              ? `${selectedClaimForDownload.project_info.project_name} (${selectedClaimForDownload.project_info.project_code})`
              : "N/A",
            selectedClaimForDownload.staff_name,
            selectedClaimForDownload.role_in_project || "N/A",
            formatDate(selectedClaimForDownload.claim_start_date),
            formatDate(selectedClaimForDownload.claim_end_date),
            `${selectedClaimForDownload.total_work_time} hours`,
            selectedClaimForDownload.claim_status,
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
          0: { cellWidth: 120 }, // Claim Name
          1: { cellWidth: 180 }, // Project
          2: { cellWidth: 100 }, // Requester
          3: { cellWidth: 80 }, // Role
          4: { cellWidth: 80 }, // Start Date
          5: { cellWidth: 80 }, // End Date
          6: { cellWidth: 80 }, // Hours
          7: { cellWidth: 80 }, // Status
        },
        margin: { top: 60, right: 30, bottom: 30, left: 30 },
        didDrawPage: (data) => {
          // Add page number if there are multiple pages
          doc.setFontSize(10);
          doc.text(
            `Page ${doc.getCurrentPageInfo().pageNumber}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        },
      });

      const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
      const fileName = `claim-${selectedClaimForDownload.claim_name}_${timestamp}.pdf`;

      doc
        .save(fileName, {
          returnPromise: true,
        })
        .then(() => {
          toast.success("PDF file downloaded successfully!", {
            icon: "✅",
          });
          setLoading(false);
        });
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast("Failed to create PDF file. Please try again.", {
        icon: "❌",
      });
      setLoading(false);
    }
    handleDownloadClose();
  };

  const handleDownloadAllExcel = () => {
    try {
      setLoading(true);
      const data = filteredClaims.map((claim) => ({
        "Claim Name": claim.claim_name,
        Project: claim.project_info
          ? `${claim.project_info.project_name} (${claim.project_info.project_code})`
          : "N/A",
        Requester: claim.staff_name,
        Role: claim.role_in_project || "N/A",
        "Start Date": formatDate(claim.claim_start_date),
        "End Date": formatDate(claim.claim_end_date),
        "Total Hours": `${claim.total_work_time} hours`,
        Status: claim.claim_status,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "All Claims");

      const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
      const fileName = `all-claims_${timestamp}.xlsx`;

      // Save with dialog
      XLSX.writeFile(wb, fileName, {
        bookType: "xlsx",
        bookSST: false,
        type: "file",
      });

      toast.success("Excel file downloaded successfully!", {
        icon: "✅",
      });
    } catch (error) {
      console.error("Error creating Excel:", error);
      toast("Failed to create Excel file. Please try again.", {
        icon: "❌",
      });
    } finally {
      setLoading(false);
      handleDownloadAllClose();
    }
  };

  const handleDownloadAllPDF = () => {
    try {
      setLoading(true);
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      doc.setFontSize(20);
      doc.text("Claims Report", doc.internal.pageSize.getWidth() / 2, 40, {
        align: "center",
      });

      const tableData = {
        head: [
          [
            "Claim Name",
            "Project",
            "Requester",
            "Role",
            "Start Date",
            "End Date",
            "Hours",
            "Status",
          ],
        ],
        body: filteredClaims.map((claim) => [
          claim.claim_name,
          claim.project_info
            ? `${claim.project_info.project_name} (${claim.project_info.project_code})`
            : "N/A",
          claim.staff_name,
          claim.role_in_project || "N/A",
          formatDate(claim.claim_start_date),
          formatDate(claim.claim_end_date),
          `${claim.total_work_time} hours`,
          claim.claim_status,
        ]),
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
          0: { cellWidth: 120 }, // Claim Name
          1: { cellWidth: 180 }, // Project
          2: { cellWidth: 100 }, // Requester
          3: { cellWidth: 80 }, // Role
          4: { cellWidth: 80 }, // Start Date
          5: { cellWidth: 80 }, // End Date
          6: { cellWidth: 80 }, // Hours
          7: { cellWidth: 80 }, // Status
        },
        margin: { top: 60, right: 30, bottom: 30, left: 30 },
        didDrawPage: (data) => {
          // Add page number if there are multiple pages
          doc.setFontSize(10);
          doc.text(
            `Page ${doc.getCurrentPageInfo().pageNumber}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        },
      });

      const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
      const fileName = `all-claims_${timestamp}.pdf`;

      doc
        .save(fileName, {
          returnPromise: true,
        })
        .then(() => {
          toast.success("PDF file downloaded successfully!", {
            icon: "✅",
          });
          setLoading(false);
        });
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast("Failed to create PDF file. Please try again.", {
        icon: "❌",
      });
      setLoading(false);
    }
    handleDownloadAllClose();
  };

  return (
    <div
      className={`min-h-screen bg-gray-100 ${
        isModalOpen ? "blur-background" : ""
      }`}
    >
      <div className="p-8">
        <div className="approval-content">
          <h1 className="approval-title">Claim Approval Management</h1>

          <div className="approval-filters">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-field"
              placeholder="Search by claim name"
            />

            <Button
              variant="contained"
              size="small"
              onClick={handleDownloadAllClick}
              sx={{
                backgroundColor: "#3b82f6",
                color: "white",
                "&:hover": {
                  backgroundColor: "#2563eb",
                },
                textTransform: "none",
                ml: 2,
              }}
              startIcon={<Download />}
            >
              Download All
            </Button>
          </div>

          <TableContainer
            component={Paper}
            className="approval-table-container"
          >
            <Table stickyHeader aria-label="claims table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={headerCellStyle}>
                    Claim Name
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    Project
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    Requester
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    Role
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    Start Date
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    End Date
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    Times
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={headerCellStyle}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <div className="flex justify-center flex-row gap-2 py-4">
                        <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce"></div>
                        <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce [animation-delay:-.3s]"></div>
                        <div className="w-4 h-4 rounded-full bg-gray-700 animate-bounce [animation-delay:-.5s]"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <div className="no-claims py-4">
                        <p>No claims found matching your criteria.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((claim) => (
                    <TableRow key={claim._id}>
                      <TableCell sx={tableCellStyle}>
                        {claim.claim_name}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        {claim.project_info
                          ? `${claim.project_info.project_name} (${claim.project_info.project_code})`
                          : "N/A"}
                      </TableCell>
                      <TableCell align="center" sx={tableCellStyle}>
                        {claim.staff_name}
                      </TableCell>
                      <TableCell align="center" sx={tableCellStyle}>
                        {claim.role_in_project || "N/A"}
                      </TableCell>
                      <TableCell align="center" sx={tableCellStyle}>
                        {formatDate(claim.claim_start_date)}
                      </TableCell>
                      <TableCell align="center" sx={tableCellStyle}>
                        {formatDate(claim.claim_end_date)}
                      </TableCell>
                      <TableCell align="center" sx={tableCellStyle}>
                        {claim.total_work_time} (hours)
                      </TableCell>
                      <TableCell align="center" sx={tableCellStyle}>
                        <span
                          className={`status-badge status-${claim.claim_status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {claim.claim_status}
                        </span>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ ...tableCellStyle, minWidth: "250px" }}
                      >
                        {claim.claim_status === "Pending Approval" && (
                          <div className="action-buttons">
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                backgroundColor: "#46d179",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "#16a34a",
                                },
                                mr: 1,
                                textTransform: "none",
                              }}
                              onClick={() => handleApprove(claim._id)}
                              disabled={loading}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              color="error"
                              onClick={() => handleReject(claim._id)}
                              sx={{
                                mr: 1,
                                textTransform: "none",
                                backgroundColor: "#dc2626",
                                "&:hover": {
                                  backgroundColor: "#ef4444",
                                },
                              }}
                              disabled={loading}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              color="warning"
                              onClick={() => handleReturn(claim._id)}
                              sx={{
                                textTransform: "none",
                                backgroundColor: "#e6cb62",
                                color: "black",
                                "&:hover": {
                                  backgroundColor: "#eab308",
                                  color: "white",
                                },
                              }}
                              disabled={loading}
                            >
                              Return
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                backgroundColor: "#3b82f6",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "#2563eb",
                                },
                                textTransform: "none",
                                ml: 1,
                              }}
                              startIcon={<Download />}
                              onClick={(e) => handleDownloadClick(e, claim)}
                            >
                              Download
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredClaims.length > 0 && (
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelDisplayedRows={({ to, count }) => {
                const computedFrom = count === 0 ? 0 : page * rowsPerPage + 1;
                const computedTo = Math.min((page + 1) * rowsPerPage, count);
                return `${computedFrom}-${computedTo} of ${
                  count !== -1 ? count : `more than ${to}`
                }`;
              }}
              labelRowsPerPage="Items per page:"
              showFirstButton
              showLastButton
              sx={{
                ".MuiTablePagination-toolbar": {
                  alignItems: "center",
                  "& > *": {
                    marginBottom: 0,
                  },
                },
                ".MuiTablePagination-displayedRows": {
                  margin: 0,
                },
                ".MuiTablePagination-selectLabel": {
                  margin: 0,
                },
              }}
            />
          )}
        </div>

        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            className="bg-gray-300"
            sx={{
              m: 0,
              p: 2,
              position: "relative",
              fontSize: "1.25rem",
            }}
          >
            {currentAction === "Approved"
              ? "Approve Claim"
              : currentAction === "Rejected"
              ? "Reject Claim"
              : "Return to Draft"}
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
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
            {" "}
            {currentAction !== "Approved" && (
              <>
                <p className="modal-instruction">
                  Please provide a reason for this action:
                </p>
                <TextField
                  multiline
                  rows={6}
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  placeholder="Enter your reason here..."
                  required
                  sx={{ mt: 2 }}
                />
              </>
            )}
            {currentAction === "Approved" && (
              <p
                className="modal-instruction"
                style={{ marginTop: "40px", fontSize: "1.25rem" }}
              >
                Are you sure you want to approve this claim?
              </p>
            )}
            {error && <p className="error-message">{error}</p>}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              sx={{
                color: "gray",
                borderColor: "gray",
                "&:hover": {
                  borderColor: "darkgray",
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleModalSubmit}
              variant="contained"
              sx={{
                backgroundColor:
                  currentAction === "Approved"
                    ? "#46d179" // Green for Approve
                    : currentAction === "Draft"
                    ? "#e6cb62" // Yellow for Return
                    : "#dc2626", // Red for Reject
                color: currentAction === "Draft" ? "black" : "white",
                "&:hover": {
                  backgroundColor:
                    currentAction === "Approved"
                      ? "#16a34a" // Darker green
                      : currentAction === "Draft"
                      ? "#eab308" // Darker yellow
                      : "#ef4444", // Lighter red
                  color: "white",
                },
                minWidth: "100px",
              }}
            >
              {currentAction === "Approved" ? "Approve" : "Submit"}
            </Button>
          </DialogActions>
        </Dialog>

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
          anchorEl={downloadAllAnchorEl}
          open={Boolean(downloadAllAnchorEl)}
          onClose={handleDownloadAllClose}
        >
          <MenuItem onClick={handleDownloadAllExcel}>
            <ListItemIcon>
              <TableChart fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download All as Excel</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDownloadAllPDF}>
            <ListItemIcon>
              <PictureAsPdf fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download All as PDF</ListItemText>
          </MenuItem>
        </Menu>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ marginTop: "80px" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ApprovalPage;
