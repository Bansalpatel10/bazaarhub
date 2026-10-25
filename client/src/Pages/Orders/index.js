import React, { useContext, useEffect, useState } from "react";
import { fetchDataFromApi, openOrderInvoice } from "../../utils/api";
import {
  formatOrderId,
  formatPaymentId,
  formatUserId,
  formatProductId,
} from "../../utils/formatIds";
import Dialog from "@mui/material/Dialog";
import { MdClose, MdPrint } from "react-icons/md";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import { FaUndo } from "react-icons/fa";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setproducts] = useState([]);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const context = useContext(MyContext);

  const history = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    const token = localStorage.getItem("token");
    if (token !== "" && token !== undefined && token !== null) {
      setIsLogin(true);
    } else {
      history("/signIn");
    }

    const user = JSON.parse(localStorage.getItem("user"));
    fetchDataFromApi(`/api/orders?userid=${user?.userId}`).then((res) => {
      setOrders(Array.isArray(res) ? res : []);
    });

    context.setEnableFilterTab(false);
  }, []);

  const showProducts = (id) => {
    fetchDataFromApi(`/api/orders/${id}`).then((res) => {
      setIsOpenModal(true);
      setproducts(res?.products || []);
    });
  };

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h2 className="hd mb-1">Orders</h2>
              <p className="text-muted mb-0">
                View your past purchases, download invoices, and inspect products.
              </p>
            </div>
            <Button
              variant="outlined"
              className="btn-blue"
              onClick={() => history("/my-returns")}
            >
              View return requests
            </Button>
          </div>

          {(!orders || orders.length === 0) ? (
            <div className="card border-0 shadow-sm p-4 text-center">
              <p className="mb-2">You don&apos;t have any orders yet.</p>
              <Button
                variant="contained"
                className="btn-blue"
                onClick={() => history("/")}
              >
                Start shopping
              </Button>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive orderTable">
                  <table className="table table-striped table-bordered mb-0">
                    <thead className="thead-light">
                      <tr>
                        <th>Order Id</th>
                        <th>Payment Id</th>
                        <th>Products</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order, index) => {
                        const status = String(order?.status || "").toLowerCase();
                        const isPending = status === "pending";
                        const isDelivered = status === "delivered";
                        return (
                          <tr key={index}>
                            <td>
                              <span
                                className="text-blue font-weight-bold"
                                style={{ fontFamily: "Courier New, monospace" }}
                              >
                                {formatOrderId(order?._id || order?.id)}
                              </span>
                            </td>
                            <td>
                              <span
                                className="text-blue font-weight-bold"
                                style={{ fontFamily: "Courier New, monospace" }}
                              >
                                {formatPaymentId(order?.paymentId)}
                              </span>
                            </td>
                            <td>
                              <span
                                className="text-blue font-weight-bold"
                                style={{
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                                onClick={() => showProducts(order?._id)}
                              >
                                View products
                              </span>
                            </td>
                            <td>{order?.amount}</td>
                            <td>
                              <span
                                className={`badge ${
                                  isPending
                                    ? "badge-danger"
                                    : isDelivered
                                    ? "badge-success"
                                    : "badge-secondary"
                                }`}
                              >
                                {order?.status}
                              </span>
                            </td>
                            <td>{order?.date?.split("T")[0]}</td>
                            <td>
                              <div className="d-flex flex-wrap gap-2">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  className="btn-blue"
                                  startIcon={<MdPrint />}
                                  onClick={() => openOrderInvoice(order?._id)}
                                >
                                  Invoice
                                </Button>
                                {isDelivered && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    className="btn-blue bg-red"
                                    startIcon={<FaUndo />}
                                    onClick={() =>
                                      history(`/returns/request/${order?._id}`)
                                    }
                                  >
                                    Return request
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={isOpenModal}
        className="productModal"
        onClose={() => setIsOpenModal(false)}
      >
        <Button className="close_" onClick={() => setIsOpenModal(false)}>
          <MdClose />
        </Button>
        <h4 className="mb-1 font-weight-bold pr-5 mb-4">Products</h4>

        <div className="table-responsive orderTable">
          <table className="table table-striped table-bordered">
            <thead className="thead-light">
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
                      <td style={{ fontFamily: "Courier New, monospace" }}>
                        {formatProductId(item?.productId)}
                      </td>
                      <td style={{ whiteSpace: "inherit" }}>
                        <span>{item?.productTitle}</span>
                      </td>
                      <td>
                        <div className="img">
                          <img
                            src={item?.image}
                            alt=""
                            style={{
                              maxWidth: 60,
                              maxHeight: 60,
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      </td>
                      <td>{item?.quantity}</td>
                      <td>{item?.price}</td>
                      <td>{item?.subTotal}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Dialog>
    </>
  );
};

export default Orders;
