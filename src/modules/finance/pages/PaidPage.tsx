import { useState, useEffect } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Search,
  Download,
  PictureAsPdf,
  TableChart,
  AttachMoney,
} from "@mui/icons-material";
import axios from "axios";
import "./PaidPage.css";
import moment from "moment";
import Layout from "../../../shared/layouts/Layout";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

interface Claim {
  _id: string;
  claim_name: string;
  staff_name: string;
  project_info: {
    project_name: string;
    project_code: string;
  };
  role_in_project: string;
  total_work_time: number;
  claim_status: string;
  claim_start_date: string;
  claim_end_date: string;
  created_at: string;
  updated_at: string;
}

const API_URL = "https://management-claim-request.vercel.app/api";

const PaidPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [token, setToken] = useState("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
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

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/claims/finance-search`,
        {
          searchCondition: {
            keyword: debouncedSearchTerm || "",
            claim_status: "Approved",
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
        setClaims(response.data.data.pageData);
        setTotalCount(response.data.data.pageInfo.totalItems);
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchClaims();
  }, [token, page, rowsPerPage, debouncedSearchTerm]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenConfirmDialog = (claim: Claim) => {
    setSelectedClaim(claim);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setSelectedClaim(null);
  };

  const handlePaid = async (claim: Claim) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/claims/change-status`,
        {
          _id: claim._id,
          claim_status: "Paid",
          comment: "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setClaims((prevClaims) =>
          prevClaims.map((c) =>
            c._id === claim._id ? { ...c, claim_status: "Paid" } : c
          )
        );
        toast.success("Payment processed successfully!", {
          icon: "✅",
        });
        fetchClaims(); // Refresh the data
      }
    } catch (error) {
      console.error("Error marking as paid:", error);
      toast("Failed to process payment. Please try again.", {
        icon: "❌",
      });
    } finally {
      setLoading(false);
      handleCloseConfirmDialog();
    }
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format("DD/MM/YYYY");
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
      XLSX.writeFile(wb, fileName);

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

  const handleDownloadAllClick = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAllAnchorEl(event.currentTarget);
  };

  const handleDownloadAllClose = () => {
    setDownloadAllAnchorEl(null);
  };

  const handleDownloadAllExcel = () => {
    try {
      setLoading(true);
      const data = claims.map((claim) => ({
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

      XLSX.writeFile(wb, fileName);

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
        body: claims.map((claim) => [
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
    <Layout>
      <div className="min-h-screen bg-gray-100">
        <div className="p-8">
          <div className="finance-content">
            <h1 className="finance-title">Finance Claims Management</h1>

            <div className="finance-filters">
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-field"
                placeholder="Search by claim name"
                InputProps={{
                  startAdornment: <Search />,
                }}
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
                    color: "white",
                  },
                  textTransform: "none",
                  ml: 2,
                }}
                startIcon={<Download />}
              >
                Download All
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
            ) : claims.length === 0 ? (
              <div className="no-claims">
                <p>No claims found matching your criteria.</p>
              </div>
            ) : (
              <>
                <TableContainer
                  component={Paper}
                  className="finance-table-container"
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
                          Hours
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
                      {claims.map((claim) => (
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
                            sx={{ ...tableCellStyle, minWidth: "200px" }}
                          >
                            <div className="action-buttons">
                              {claim.claim_status === "Approved" && (
                                <>
                                  <Button
                                    variant="contained"
                                    size="medium"
                                    sx={{
                                      backgroundColor: "#46d179",
                                      color: "white",
                                      "&:hover": {
                                        backgroundColor: "#16a34a",
                                      },
                                      textTransform: "none",
                                      padding: "8px 32px",
                                      fontSize: "14px",
                                      minWidth: "120px",
                                      height: "30px",
                                      width: "100px",
                                      mr: 1,
                                    }}
                                    startIcon={<AttachMoney />}
                                    onClick={() =>
                                      handleOpenConfirmDialog(claim)
                                    }
                                  >
                                    Paid
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="medium"
                                    sx={{
                                      backgroundColor: "#3b82f6 ",
                                      color: "white",
                                      "&:hover": {
                                        backgroundColor: "#2563eb",
                                        color: "white",
                                      },
                                      textTransform: "none",
                                      padding: "8px 16px",
                                      fontSize: "14px",
                                      minWidth: "120px",
                                      height: "30px",
                                      width: "100px",
                                    }}
                                    startIcon={<Download />}
                                    onClick={(e) =>
                                      handleDownloadClick(e, claim)
                                    }
                                  >
                                    Download
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {claims.length > 0 && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelDisplayedRows={({ count }) => {
                      const computedFrom = page * rowsPerPage + 1;
                      const computedTo = Math.min(
                        (page + 1) * rowsPerPage,
                        count
                      );
                      return `${computedFrom}-${computedTo} of ${count}`;
                    }}
                    showFirstButton
                    showLastButton
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          id="confirm-dialog-title"
          sx={{ fontSize: "24px", padding: "20px 24px" }}
        >
          Confirm Payment
        </DialogTitle>
        <DialogContent sx={{ padding: "20px 24px" }}>
          Are you sure you want to mark this claim as paid?
        </DialogContent>
        <DialogActions sx={{ padding: "20px 24px" }}>
          <Button
            onClick={handleCloseConfirmDialog}
            color="primary"
            sx={{ fontSize: "16px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => selectedClaim && handlePaid(selectedClaim)}
            color="primary"
            variant="contained"
            sx={{ fontSize: "16px" }}
          >
            Confirm
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
    </Layout>
  );
};

export default PaidPage;
