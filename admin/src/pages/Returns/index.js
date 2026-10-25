import React, { useContext, useEffect, useState } from "react";
import { editData, fetchDataFromApi, openRefundInvoice } from "../../utils/api";
import { MdPrint } from "react-icons/md";
import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import { MdClose } from "react-icons/md";
import { MdOutlineEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { MyContext } from "../../App";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";

const formatOrderId = (id) => {
  if (!id) return "";
  const str = typeof id === "object" ? id.toString() : String(id);
  const uniquePart = str.slice(-6).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `ORD-${year}${month}${day}-${uniquePart}`;
};

const formatReturnId = (id) => {
  if (!id) return "";
  const str = typeof id === "object" ? id.toString() : String(id);
  const uniquePart = str.slice(-6).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `REF-${year}${month}${day}-${uniquePart}`;
};

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const STATUS_OPTIONS = ["Pending", "Confirmed", "Picked Up", "Refund Initiated"];

const Returns = () => {
  const [returnsList, setReturnsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailModal, setDetailModal] = useState(null);

  const context = useContext(MyContext);

  const loadReturns = () => {
    fetchDataFromApi("/api/returns").then((res) => {
      setReturnsList(Array.isArray(res) ? res : []);
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadReturns();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleStatusChange = (returnId, newStatus) => {
    setIsLoading(true);
    context.setProgress(40);
    editData(`/api/returns/${returnId}`, { status: newStatus })
      .then(() => {
        loadReturns();
        context.setProgress(100);
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Return status updated successfully.",
        });
        if (detailModal?._id === returnId) {
          setDetailModal((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      })
      .catch(() => {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Failed to update status.",
        });
      })
      .finally(() => setIsLoading(false));
  };

  const orderIdDisplay = (r) => {
    const oid = r?.orderId?._id || r?.orderId;
    return formatOrderId(oid || "");
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
          <h5 className="mb-0">Return Management</h5>
          <div className="ml-auto d-flex align-items-center">
            <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
              <StyledBreadcrumb
                component="a"
                href="#"
                label="Dashboard"
                icon={<HomeIcon fontSize="small" />}
              />
              <StyledBreadcrumb label="Returns" deleteIcon={<ExpandMoreIcon />} />
            </Breadcrumbs>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="returns table">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ minWidth: 120 }}>Return ID</TableCell>
                    <TableCell style={{ minWidth: 130 }}>Order ID</TableCell>
                    <TableCell style={{ minWidth: 120 }}>Customer</TableCell>
                    <TableCell style={{ minWidth: 140 }}>Email</TableCell>
                    <TableCell style={{ minWidth: 110 }}>Phone</TableCell>
                    <TableCell style={{ minWidth: 180 }}>Reason</TableCell>
                    <TableCell style={{ minWidth: 90 }}>Image</TableCell>
                    <TableCell style={{ minWidth: 150 }}>Status</TableCell>
                    <TableCell style={{ minWidth: 100 }}>Date</TableCell>
                    <TableCell style={{ minWidth: 120 }}>Invoice</TableCell>
                    <TableCell style={{ minWidth: 80 }}>View</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returnsList
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((r, index) => (
                      <TableRow key={r._id || index}>
                        <TableCell style={{ fontFamily: "Courier New, monospace" }}>
                          {formatReturnId(r._id)}
                        </TableCell>
                        <TableCell style={{ fontFamily: "Courier New, monospace" }}>
                          {orderIdDisplay(r)}
                        </TableCell>
                        <TableCell>{r.customerName}</TableCell>
                        <TableCell>
                          <MdOutlineEmail /> {r.customerEmail}
                        </TableCell>
                        <TableCell>
                          <FaPhoneAlt /> {r.customerPhone}
                        </TableCell>
                        <TableCell>{r.reason}</TableCell>
                        <TableCell>
                          {r.productImageUrl ? (
                            <a
                              href={r.productImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              View
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {r.status === "Refund Initiated" ? (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                background: "#e8f5e9",
                                color: "#2e7d32",
                                borderRadius: 4,
                                fontWeight: 500,
                                fontSize: "0.875rem",
                              }}
                            >
                              Refund Initiated
                            </span>
                          ) : (
                            <Select
                              disabled={isLoading}
                              value={r.status || "Pending"}
                              onChange={(e) => handleStatusChange(r._id, e.target.value)}
                              size="small"
                              displayEmpty
                              inputProps={{ "aria-label": "Status" }}
                              className="w-100"
                              style={{ minWidth: 140 }}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <MenuItem key={s} value={s}>
                                  {s}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>{r.date?.split("T")[0] || ""}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<MdPrint />}
                            onClick={() => r._id && openRefundInvoice(r._id)}
                            style={{ textTransform: "none" }}
                          >
                            Refund Invoice
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setDetailModal(r)}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={returnsList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>

      <Dialog
        open={!!detailModal}
        onClose={() => setDetailModal(null)}
        maxWidth="md"
        fullWidth
        className="productModal"
      >
        <Button
          className="close_"
          onClick={() => setDetailModal(null)}
          style={{ position: "absolute", right: 10, top: 10, zIndex: 1 }}
        >
          <MdClose />
        </Button>
        {detailModal && (
          <div className="p-4">
            <h4 className="mb-4">Return Request Details</h4>
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Return ID:</strong> <span style={{ fontFamily: "Courier New, monospace" }}>{formatReturnId(detailModal._id)}</span>
              </div>
              <div className="col-md-6">
                <strong>Order ID:</strong> <span style={{ fontFamily: "Courier New, monospace" }}>{orderIdDisplay(detailModal)}</span>
              </div>
              <div className="col-md-6">
                <strong>Status:</strong> {detailModal.status}
              </div>
              <div className="col-md-6">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<MdPrint />}
                  onClick={() => detailModal._id && openRefundInvoice(detailModal._id)}
                  style={{ textTransform: "none" }}
                >
                  Print Refund Invoice
                </Button>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Customer:</strong> {detailModal.customerName}
              </div>
              <div className="col-md-6">
                <strong>Email:</strong> {detailModal.customerEmail}
              </div>
              <div className="col-md-6">
                <strong>Phone:</strong> {detailModal.customerPhone}
              </div>
            </div>
            <div className="mb-3">
              <strong>Reason:</strong> {detailModal.reason}
            </div>
            {detailModal.description && (
              <div className="mb-3">
                <strong>Description:</strong> {detailModal.description}
              </div>
            )}
            {(detailModal.bankDetails?.bankName || detailModal.bankDetails?.accountHolderName || detailModal.bankDetails?.accountNumber || detailModal.bankDetails?.ifscCode) && (
              <div className="mb-3 p-3 border rounded">
                <strong>Bank details for refund:</strong>
                <div className="mt-2 small">
                  <div><strong>Bank:</strong> {detailModal.bankDetails.bankName || "-"}</div>
                  <div><strong>Account holder:</strong> {detailModal.bankDetails.accountHolderName || "-"}</div>
                  <div><strong>Account number:</strong> {detailModal.bankDetails.accountNumber || "-"}</div>
                  <div><strong>IFSC:</strong> {detailModal.bankDetails.ifscCode || "-"}</div>
                </div>
              </div>
            )}
            <div className="mb-3">
              <strong>Product image:</strong>
              <br />
              {detailModal.productImageUrl && (
                <a
                  href={detailModal.productImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={detailModal.productImageUrl}
                    alt="Return product"
                    style={{ maxWidth: 200, maxHeight: 200, objectFit: "cover", marginTop: 8 }}
                  />
                </a>
              )}
            </div>
            <div className="mb-3">
              <strong>Products in order:</strong>
              <table className="table table-sm table-bordered mt-2">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>SubTotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(detailModal.orderDetails?.products || []).map((p, i) => (
                    <tr key={i}>
                      <td>{p.productTitle}</td>
                      <td>{p.quantity}</td>
                      <td>{p.price}</td>
                      <td>{p.subTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <strong>Update status:</strong>
              {detailModal.status === "Refund Initiated" ? (
                <div className="mt-2">
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      background: "#e8f5e9",
                      color: "#2e7d32",
                      borderRadius: 4,
                      fontWeight: 500,
                    }}
                  >
                    Refund Initiated — status cannot be changed
                  </span>
                </div>
              ) : (
                <Select
                  disabled={isLoading}
                  value={detailModal.status || "Pending"}
                  onChange={(e) => handleStatusChange(detailModal._id, e.target.value)}
                  size="small"
                  className="mt-2"
                  style={{ minWidth: 180 }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default Returns;
