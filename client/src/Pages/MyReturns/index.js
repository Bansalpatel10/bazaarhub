import React, { useContext, useEffect, useState } from 'react';
import { fetchDataFromApi, openRefundInvoice } from '../../utils/api';
import { formatOrderId, formatPaymentId, formatProductId, formatReturnId } from '../../utils/formatIds';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import Dialog from '@mui/material/Dialog';
import { MdClose, MdPrint } from 'react-icons/md';
import { FaUndo } from 'react-icons/fa';

const MyReturns = () => {
    const [orders, setOrders] = useState([]);
    const [returnRequests, setReturnRequests] = useState([]);
    const [products, setProducts] = useState([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    const context = useContext(MyContext);
    const history = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);

        const token = localStorage.getItem('token');
        if (token === '' || token === undefined || token === null) {
            history('/signIn');
            return;
        }
        setIsLogin(true);

        const user = JSON.parse(localStorage.getItem('user'));
        fetchDataFromApi(`/api/orders?userid=${user?.userId}`).then((res) => {
            setOrders(Array.isArray(res) ? res : []);
        });
        fetchDataFromApi(`/api/returns/user/${user?.userId}`).then((res) => {
            setReturnRequests(Array.isArray(res) ? res : []);
        });

        context.setEnableFilterTab(false);
    }, []);

    const deliveredOrders = orders?.filter((o) => o?.status === 'delivered') || [];
    const hasReturnForOrder = (orderId) =>
        returnRequests?.some((r) => r?.orderId?._id === orderId || r?.orderId === orderId);

    const getReturnForOrder = (orderId) =>
        returnRequests?.find((r) => r?.orderId?._id === orderId || r?.orderId === orderId);

    const showProducts = (id) => {
        fetchDataFromApi(`/api/orders/${id}`).then((res) => {
            setProducts(res?.products || []);
            setIsOpenModal(true);
        });
    };

    return (
        <>
            <section className="section">
                <div className="container">
                    <h2 className="hd">My Returns</h2>
                    <p className="text-muted mb-4">
                        Track your return requests and create new returns for delivered orders.
                    </p>

                    {returnRequests?.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="mb-0">Your return requests</h5>
                                    <small className="text-muted">Latest return requests appear at the top.</small>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered mb-0">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Return ID</th>
                                            <th>Order ID</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returnRequests.map((r) => (
                                            <tr key={r._id}>
                                                <td style={{ fontFamily: 'Courier New, monospace' }}>{formatReturnId(r._id)}</td>
                                                <td style={{ fontFamily: 'Courier New, monospace' }}>{formatOrderId(r?.orderId?._id || r?.orderId)}</td>
                                                <td><span className="badge badge-secondary">{r?.status}</span></td>
                                                <td>{r?.date?.split('T')[0]}</td>
                                                <td>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        className="btn-blue"
                                                        startIcon={<MdPrint />}
                                                        onClick={() => openRefundInvoice(r._id)}
                                                    >
                                                        Print refund invoice
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {deliveredOrders?.length === 0 ? (
                        <div className="alert alert-info">
                            You have no delivered orders eligible for return.
                        </div>
                    ) : (
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">Delivered orders eligible for return</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive orderTable">
                                    <table className="table table-striped table-bordered mb-0">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Order Id</th>
                                                <th>Payment Id</th>
                                                <th>Products</th>
                                                <th>Total Amount</th>
                                                <th>Order Status</th>
                                                <th>Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deliveredOrders?.map((order, index) => {
                                                const hasReturn = hasReturnForOrder(order?._id);
                                                const returnReq = getReturnForOrder(order?._id);
                                                return (
                                                    <tr key={index}>
                                                        <td>
                                                            <span
                                                                className="text-blue font-weight-bold"
                                                                style={{ fontFamily: 'Courier New, monospace' }}
                                                            >
                                                                {formatOrderId(order?._id)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className="text-blue font-weight-bold"
                                                                style={{ fontFamily: 'Courier New, monospace' }}
                                                            >
                                                                {formatPaymentId(order?.paymentId)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className="text-blue font-weight-bold cursor"
                                                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                                onClick={() => showProducts(order?._id)}
                                                            >
                                                                View products
                                                            </span>
                                                        </td>
                                                        <td>{order?.amount}</td>
                                                        <td>
                                                            <span className="badge badge-success">{order?.status}</span>
                                                        </td>
                                                        <td>{order?.date?.split('T')[0]}</td>
                                                        <td>
                                                            {hasReturn ? (
                                                                <>
                                                                    <span className="badge bg-secondary me-2">{returnReq?.status}</span>
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        className="btn-blue ml-1"
                                                                        startIcon={<MdPrint />}
                                                                        onClick={() => openRefundInvoice(returnReq._id)}
                                                                    >
                                                                        Refund invoice
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    className="btn-blue bg-red"
                                                                    startIcon={<FaUndo />}
                                                                    onClick={() => history(`/returns/request/${order?._id}`)}
                                                                >
                                                                    Return
                                                                </Button>
                                                            )}
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

            <Dialog open={isOpenModal} className="productModal" onClose={() => setIsOpenModal(false)}>
                <Button className="close_" onClick={() => setIsOpenModal(false)}><MdClose /></Button>
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
                            {products?.length !== 0 && products?.map((item, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontFamily: 'Courier New, monospace' }}>{formatProductId(item?.productId)}</td>
                                    <td style={{ whiteSpace: 'inherit' }}>{item?.productTitle}</td>
                                    <td>
                                        <div className="img">
                                            <img src={item?.image} alt="" style={{ maxWidth: 60, maxHeight: 60, objectFit: 'cover' }} />
                                        </div>
                                    </td>
                                    <td>{item?.quantity}</td>
                                    <td>{item?.price}</td>
                                    <td>{item?.subTotal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Dialog>
        </>
    );
};

export default MyReturns;
