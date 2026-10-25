import React, { useContext, useRef } from "react";
import { editData, fetchDataFromApi, openOrderInvoice } from "../../utils/api";
import { useState } from "react";
import { useEffect } from "react";
import * as XLSX from "xlsx";

import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import { MdClose } from "react-icons/md";
import Button from "@mui/material/Button";
import { MdOutlineEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { MdOutlineDateRange } from "react-icons/md";
import { MdPrint } from "react-icons/md";
import { MdSearch } from "react-icons/md";
import GetAppIcon from "@mui/icons-material/GetApp";
import { FaBox } from "react-icons/fa";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { MyContext } from "../../App";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

// Utility functions for formatting IDs
const formatOrderId = (id) => {
  if (!id) return '';
  
  // Get current date components
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Extract last 6 characters of the original ID and make them uppercase
  const uniquePart = id.slice(-6).toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Format: ORD-YYMMDD-UNIQUE
  return `ORD-${year}${month}${day}-${uniquePart}`;
};

const formatPaymentId = (paymentId) => {
  if (!paymentId) return '';
  
  // Extract alphanumeric characters and make uppercase
  const cleanId = paymentId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Format: PAY-XXXX-XXXX
  const part1 = cleanId.slice(0, 4);
  const part2 = cleanId.slice(4, 8);
  
  return `PAY-${part1}-${part2}`;
};

// NEW: Format Product ID properly
const formatProductId = (productId) => {
  if (!productId) return '';
  
  // If it's already an ObjectId, take last 6 chars and format
  const cleanId = productId.toString().replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const shortId = cleanId.slice(-8);
  
  return `PRD-${shortId}`;
};

// Format User ID professionally
const formatUserId = (userId) => {
  if (!userId) return '';
  const str = typeof userId === 'object' ? (userId?.toString?.() || String(userId)) : String(userId);
  const cleanId = str.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const shortId = cleanId.slice(-8);
  return shortId ? `USR-${shortId}` : 'USR-';
};

//breadcrumb code
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

const columns = [
  { id: "orderId", label: "Order Id", minWidth: 150 },
  { id: "paymantId", label: "Payment Id", minWidth: 150 },
  {
    id: "products",
    label: "Products",
    minWidth: 150,
  },
  {
    id: "name",
    label: "Name",
    minWidth: 130,
  },
  {
    id: "phoneNumber",
    label: "Phone Number",
    minWidth: 150,
  },
  {
    id: "address",
    label: "Address",
    minWidth: 200,
  },
  {
    id: "pincode",
    label: "Pincode",
    minWidth: 120,
  },
  {
    id: "totalAmount",
    label: "Total Amount",
    minWidth: 120,
  },
  {
    id: "email",
    label: "Email",
    minWidth: 120,
  },
  {
    id: "userId",
    label: "User Id",
    minWidth: 120,
  },
  {
    id: "orderStatus",
    label: "Order Status",
    minWidth: 120,
  },
  {
    id: "dateCreated",
    label: "Date Created",
    minWidth: 150,
  },
  {
    id: "print",
    label: "Label",
    minWidth: 160,
  },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [products, setproducts] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenPrintModal, setIsOpenPrintModal] = useState(false);

  const [singleOrder, setSingleOrder] = useState();
  const [statusVal, setstatusVal] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [printAnchorEl, setPrintAnchorEl] = useState(null);
  const [printOrderForMenu, setPrintOrderForMenu] = useState(null);

  // NEW: State for search and tabs
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);

  const context = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);

  const [page1, setPage1] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const printRef = useRef();

  const handleChangePage = (event, newPage) => {
    setPage1(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage1(0);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    fetchDataFromApi(`/api/orders`).then((res) => {
      setOrders(res);
      setFilteredOrders(res);
    });
  }, []);

  // NEW: Filter orders based on search and tabs
  useEffect(() => {
    let filtered = [...orders];

    // Tab filter
    if (tabValue === 1) {
      filtered = filtered.filter((order) => order?.status === "pending");
    } else if (tabValue === 2) {
      filtered = filtered.filter((order) => order?.status === "confirm");
    } else if (tabValue === 3) {
      filtered = filtered.filter((order) => order?.status === "delivered");
    }

    // Search filter - only by Order ID
    if (searchTerm) {
      filtered = filtered.filter((order) => {
        const orderId = formatOrderId(order?._id);
        return orderId.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredOrders(filtered);
  }, [searchTerm, tabValue, orders]);

  const showProducts = (id) => {
    fetchDataFromApi(`/api/orders/${id}`).then((res) => {
      setIsOpenModal(true);
      setproducts(res.products);
    });
  };

  const handlePrintLabelClick = (event, order) => {
    setPrintAnchorEl(event.currentTarget);
    setPrintOrderForMenu(order);
  };

  const handlePrintMenuClose = () => {
    setPrintAnchorEl(null);
    setPrintOrderForMenu(null);
  };

  const handlePrintLabelOption = (order) => {
    handlePrintMenuClose();
    setPrintOrder(order);
    setIsOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setIsOpenPrintModal(false);
    setPrintOrder(null);
  };

  const handlePrint = () => {
    if (!printOrder) return;
    
    const formattedOrderId = formatOrderId(printOrder?._id);
    const formattedPaymentId = formatPaymentId(printOrder?.paymentId);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Label - ${formattedOrderId}</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 0;
              padding: 0;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            
            .shipping-label { 
              width: 100%;
              max-width: 900px;
              margin: 0 auto;
              background: white;
              padding: 15px;
              page-break-after: avoid;
              page-break-before: avoid;
            }
            
            /* Header Section */
            .label-header {
              text-align: center;
              padding: 10px 0;
              border-bottom: 2px solid #000;
              margin-bottom: 15px;
            }
            
            .label-header h1 {
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 1px;
            }
            
            .label-header .order-ref {
              font-size: 14px;
              color: #555;
              margin-top: 5px;
            }
            
            /* Two Column Layout */
            .two-column {
              display: flex;
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .column {
              flex: 1;
              border: 1px solid #ddd;
              padding: 12px;
              border-radius: 4px;
            }
            
            .column-title {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px solid #eee;
              color: #333;
              text-transform: uppercase;
            }
            
            .info-row {
              display: flex;
              margin-bottom: 6px;
              font-size: 13px;
            }
            
            .info-label {
              width: 100px;
              font-weight: bold;
              color: #555;
            }
            
            .info-value {
              flex: 1;
              color: #333;
            }
            
            /* ID Section */
            .id-section {
              background: #f8f9fa;
              padding: 10px;
              border-radius: 4px;
              margin-bottom: 15px;
              border-left: 4px solid #333;
              font-family: 'Courier New', monospace;
              font-size: 14px;
            }
            
            /* Products Table */
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 12px;
            }
            
            .products-table th {
              background: #f0f0f0;
              padding: 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            
            .products-table td {
              padding: 6px 8px;
              border: 1px solid #ddd;
            }
            
            .products-table tfoot td {
              background: #f8f9fa;
              font-weight: bold;
            }
            
            /* Summary Section */
            .summary-section {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 15px 0;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            
            .total-amount {
              font-size: 16px;
              font-weight: bold;
              color: #000;
            }
            
            /* Footer */
            .label-footer {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px dashed #ddd;
              text-align: center;
              font-size: 11px;
              color: #666;
            }
            
            /* Print specific styles */
            @media print {
              body { 
                padding: 0;
                margin: 0;
              }
              .shipping-label {
                padding: 10px;
              }
            }
            
            /* Address Box */
            .address-box {
              background: #fff;
              padding: 10px;
              border: 1px solid #ddd;
              min-height: 80px;
            }
            
            .phone-highlight {
              font-weight: bold;
              color: #000;
              font-size: 14px;
            }
            
            /* Badge */
            .status-badge {
              display: inline-block;
              padding: 3px 8px;
              background: #28a745;
              color: white;
              font-size: 11px;
              border-radius: 3px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="shipping-label">
            <!-- Header with Order Reference -->
            <div class="label-header">
              <h1>SHIPPING LABEL</h1>
              <div class="order-ref">Order #${formattedOrderId}</div>
            </div>
            
            <!-- ID Section -->
            <div class="id-section">
              <strong>ORDER ID:</strong> ${formattedOrderId} &nbsp;&nbsp;|&nbsp;&nbsp; 
              <strong>PAYMENT ID:</strong> ${formattedPaymentId} &nbsp;&nbsp;|&nbsp;&nbsp;
              <strong>DATE:</strong> ${printOrder?.date?.split("T")[0] || ''}
            </div>
            
            <!-- Two Column Layout for Shipping and Order Info -->
            <div class="two-column">
              <!-- Left Column: Shipping Address -->
              <div class="column">
                <div class="column-title">📦 SHIP TO</div>
                <div class="address-box">
                  <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">${printOrder?.name || ''}</div>
                  <div style="margin-bottom: 5px;">${printOrder?.address || ''}</div>
                  <div style="margin-bottom: 5px;">Pincode: ${printOrder?.pincode || ''}</div>
                  <div class="phone-highlight">📞 ${printOrder?.phoneNumber || ''}</div>
                </div>
              </div>
              
              <!-- Right Column: Order Information -->
              <div class="column">
                <div class="column-title">📋 ORDER INFORMATION</div>
                <div class="info-row">
                  <span class="info-label">Order ID:</span>
                  <span class="info-value">${formattedOrderId}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment ID:</span>
                  <span class="info-value">${formattedPaymentId}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Order Date:</span>
                  <span class="info-value">${printOrder?.date?.split("T")[0] || ''}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="info-value"><span class="status-badge">${printOrder?.status || ''}</span></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Items:</span>
                  <span class="info-value">${printOrder?.products?.length || 0} item(s)</span>
                </div>
              </div>
            </div>
            
            <!-- Products Table -->
            <div class="column-title">🛍️ ORDER ITEMS</div>
            <table class="products-table">
              <thead>
                <tr>
                  <th width="25%">Product ID</th>
                  <th width="40%">Product Title</th>
                  <th width="10%">Qty</th>
                  <th width="12%">Price</th>
                  <th width="13%">SubTotal</th>
                </tr>
              </thead>
              <tbody>
                ${printOrder?.products?.map((item) => `
                  <tr>
                    <td>${formatProductId(item?.productId) || ''}</td>
                    <td>${item?.productTitle?.substring(0, 40) || ''}</td>
                    <td>${item?.quantity || ''}</td>
                    <td>₹${item?.price || ''}</td>
                    <td>₹${item?.subTotal || ''}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align: right; font-weight: bold;">Total Amount:</td>
                  <td style="font-weight: bold;">₹${printOrder?.amount || ''}</td>
                </tr>
              </tfoot>
            </table>
            
            <!-- Summary Section -->
            <div class="summary-section">
              <div>Payment Method: Online Payment</div>
              <div class="total-amount">Total: ₹${printOrder?.amount || ''}</div>
            </div>
            
            <!-- Footer -->
            <div class="label-footer">
              <div>This is a computer generated shipping label - no signature required</div>
              <div style="margin-top: 5px;">For any queries, contact support with Order ID: ${formattedOrderId}</div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.print();
      printWindow.onafterprint = function() {
        printWindow.close();
      };
    };
    
    handleClosePrintModal();
  };

  const handleChangeStatus = (e, orderId) => {
    setstatusVal(e.target.value);
    setIsLoading(true);
    context.setProgress(40);
    fetchDataFromApi(`/api/orders/${orderId}`).then((res) => {
      const order = {
        name: res.name,
        phoneNumber: res.phoneNumber,
        address: res.address,
        pincode: res.pincode,
        amount: parseInt(res.amount),
        paymentId: res.paymentId,
        email: res.email,
        userid: res.userId,
        products: res.products,
        status: e.target.value,
      };

      editData(`/api/orders/${orderId}`, order).then((res) => {
        fetchDataFromApi(`/api/orders`).then((res) => {
          setOrders(res);
        });
        context.setProgress(100);
        setIsLoading(false);
      });

      setSingleOrder(res.products);
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExportExcel = () => {
    const headers = [
      "Order Id",
      "Payment Id",
      "Products Count",
      "Name",
      "Phone Number",
      "Address",
      "Pincode",
      "Total Amount",
      "Email",
      "User Id",
      "Order Status",
      "Date Created",
    ];
    const rows = (filteredOrders || []).map((order) => [
      formatOrderId(order?._id),
      formatPaymentId(order?.paymentId),
      order?.products?.length ?? 0,
      order?.name ?? "",
      order?.phoneNumber ?? "",
      order?.address ?? "",
      order?.pincode ?? "",
      order?.amount ?? "",
      order?.email ?? "",
      formatUserId(order?.userid),
      order?.status ?? "",
      order?.date?.split("T")[0] ?? "",
    ]);
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    const fileName = `orders_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
          <h5 className="mb-0">Orders List</h5>

          <div className="ml-auto d-flex align-items-center">
            <Breadcrumbs
              aria-label="breadcrumb"
              className="ml-auto breadcrumbs_"
            >
              <StyledBreadcrumb
                component="a"
                href="#"
                label="Dashboard"
                icon={<HomeIcon fontSize="small" />}
              />

              <StyledBreadcrumb
                label="Orders"
                deleteIcon={<ExpandMoreIcon />}
              />
            </Breadcrumbs>
          </div>
        </div>

        {/* NEW: Search Bar and Tabs */}
        <div className="card shadow border-0 p-3 mt-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <TextField
              size="small"
              placeholder="Search by Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdSearch />
                  </InputAdornment>
                ),
              }}
              style={{ width: '300px' }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<GetAppIcon />}
              onClick={handleExportExcel}
              style={{ textTransform: 'none' }}
            >
              Export to Excel
            </Button>
          </div>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="All Orders" />
              <Tab label="Pending" />
              <Tab label="Confirmed" />
              <Tab label="Delivered" />
            </Tabs>
          </Box>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredOrders?.length !== 0 &&
                    filteredOrders
                      ?.slice(
                        page1 * rowsPerPage,
                        page1 * rowsPerPage + rowsPerPage
                      )
                      ?.reverse()
                      ?.map((order, index) => {
                        const formattedOrderId = formatOrderId(order?._id);
                        const formattedPaymentId = formatPaymentId(order?.paymentId);
                        // NEW: Check if order is delivered to disable status change
                        const isDelivered = order?.status === "delivered";
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <span className="text-blue font-weight-bold" style={{ fontFamily: 'Courier New, monospace' }}>
                                {formattedOrderId}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-blue font-weight-bold" style={{ fontFamily: 'Courier New, monospace' }}>
                                {formattedPaymentId}
                              </span>
                            </TableCell>
                            <TableCell>
                              {/* NEW: Professional looking view items button */}
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<FaBox />}
                                onClick={() => showProducts(order?._id)}
                                style={{
                                  textTransform: 'none',
                                  borderRadius: '4px',
                                  padding: '2px 8px',
                                  fontSize: '0.75rem'
                                }}
                              >
                                View Items ({order?.products?.length || 0})
                              </Button>
                            </TableCell>
                            <TableCell>{order?.name}</TableCell>
                            <TableCell>
                              <FaPhoneAlt /> {order?.phoneNumber}
                            </TableCell>
                            <TableCell>{order?.address}</TableCell>
                            <TableCell>{order?.pincode}</TableCell>
                            <TableCell>
                              <MdOutlineCurrencyRupee /> {order?.amount}
                            </TableCell>
                            <TableCell>
                              <MdOutlineEmail /> {order?.email}
                            </TableCell>
                            <TableCell style={{ fontFamily: 'Courier New, monospace' }}>
                              {formatUserId(order?.userid)}
                            </TableCell>
                            <TableCell>
                              {/* Order Status dropdown with proper label */}
                              <FormControl size="small" className="w-100" disabled={isLoading === true || isDelivered}>
                                <InputLabel id={`order-status-label-${index}`}>Status</InputLabel>
                                <Select
                                  labelId={`order-status-label-${index}`}
                                  label="Status"
                                  disabled={isLoading === true || isDelivered}
                                  value={
                                    order?.status !== null
                                      ? order?.status
                                      : statusVal
                                  }
                                  onChange={(e) =>
                                    handleChangeStatus(e, order?._id)
                                  }
                                  displayEmpty
                                  size="small"
                                  style={{
                                    opacity: isDelivered ? 0.7 : 1,
                                    pointerEvents: isDelivered ? 'none' : 'auto'
                                  }}
                                >
                                  <MenuItem value={null}>
                                    <em>None</em>
                                  </MenuItem>
                                  <MenuItem value="pending">Pending</MenuItem>
                                  <MenuItem value="confirm">Confirm</MenuItem>
                                  <MenuItem value="delivered">Delivered</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <MdOutlineDateRange />{" "}
                              {order?.date?.split("T")[0]}
                            </TableCell>
                            <TableCell>
                              {/* Label dropdown: Shipping Label | Order Invoice */}
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<MdPrint />}
                                endIcon={<ExpandMoreIcon />}
                                onClick={(e) => handlePrintLabelClick(e, order)}
                                style={{ textTransform: 'none', minWidth: 140 }}
                              >
                                Label
                              </Button>
                              <Menu
                                anchorEl={printAnchorEl}
                                open={Boolean(printAnchorEl)}
                                onClose={handlePrintMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                MenuListProps={{ "aria-labelledby": "label-menu" }}
                              >
                                <MenuItem
                                  onClick={() => handlePrintLabelOption(printOrderForMenu)}
                                  dense
                                >
                                  <MdPrint className="me-2" fontSize="small" /> Shipping Label
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    handlePrintMenuClose();
                                    if (printOrderForMenu?._id) openOrderInvoice(printOrderForMenu._id);
                                  }}
                                  dense
                                >
                                  <MdPrint className="me-2" fontSize="small" /> Order Invoice
                                </MenuItem>
                              </Menu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={filteredOrders?.length}
              rowsPerPage={rowsPerPage}
              page={page1}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>

      {/* Products Modal */}
      <Dialog open={isOpenModal} onClose={() => setIsOpenModal(false)} className="productModal">
        <Button className="close_" onClick={() => setIsOpenModal(false)} style={{ position: 'absolute', right: 10, top: 10 }}>
          <MdClose />
        </Button>
        <h4 className="mb-1 font-weight-bold pr-5 mb-4">Order Items</h4>

        <div className="table-responsive orderTable">
          <table className="table table-striped table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Product Id</th>
                <th>Product Title</th>
                <th>Image</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>SubTotal</th>
              </tr>
            </thead>

            <tbody>
              {products?.length !== 0 &&
                products?.map((item, index) => {
                  return (
                    <tr key={index}>
                      {/* NEW: Properly formatted Product ID */}
                      <td style={{ fontFamily: 'Courier New, monospace' }}>
                        {formatProductId(item?.productId)}
                      </td>
                      <td style={{ whiteSpace: "inherit" }}>
                        <span>{item?.productTitle?.substr(0, 30) + "..."}</span>
                      </td>
                      <td>
                        <div className="img">
                          <img src={item?.image} alt={item?.productTitle} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                        </div>
                      </td>
                      <td>{item?.quantity}</td>
                      <td>₹{item?.price}</td>
                      <td>₹{item?.subTotal}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Dialog>

      {/* Print Confirmation Modal */}
      <Dialog 
        open={isOpenPrintModal} 
        onClose={handleClosePrintModal}
        className="printModal"
        maxWidth="sm"
        fullWidth
      >
        <Button className="close_" onClick={handleClosePrintModal} style={{ position: 'absolute', right: 10, top: 10, zIndex: 1 }}>
          <MdClose />
        </Button>
        
        <div className="p-4">
          <h4 className="text-center mb-4">Print Shipping Label</h4>
          
          {printOrder && (
            <div className="text-center">
              <p>Ready to print shipping label for order:</p>
              <p style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold', fontSize: '16px' }}>
                {formatOrderId(printOrder?._id)}
              </p>
              
              <div className="mt-4 d-flex justify-content-center gap-3">
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<MdPrint />}
                  onClick={handlePrint}
                  size="large"
                  style={{ marginRight: '10px' }}
                >
                  Print Now
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleClosePrintModal}
                  size="large"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default Orders;