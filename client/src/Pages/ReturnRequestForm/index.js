import React, { useContext, useEffect, useState } from 'react';
import { fetchDataFromApi, postData, uploadImage } from '../../utils/api';
import { formatOrderId, formatPaymentId } from '../../utils/formatIds';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useNavigate, useParams } from 'react-router-dom';
import { MyContext } from '../../App';
import CircularProgress from '@mui/material/CircularProgress';
import { IoMdCloudUpload } from 'react-icons/io';

const RETURN_REASONS = [
    'Defective or damaged product',
    'Wrong item received',
    'Not as described',
    'Changed my mind',
    'Quality issues',
    'Other',
];

const ReturnRequestForm = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [productImageUrl, setProductImageUrl] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountHolderName, setAccountHolderName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const context = useContext(MyContext);
    const history = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);

        const token = localStorage.getItem('token');
        if (!token || token === '' || token === undefined || token === null) {
            history('/signIn');
            return;
        }

        Promise.all([
            fetchDataFromApi(`/api/orders/${orderId}`),
            fetchDataFromApi(`/api/returns/check/${orderId}`),
        ]).then(([orderRes, checkRes]) => {
            if (checkRes?.exists) {
                setError('A return request for this order already exists.');
                return;
            }
            if (!orderRes) {
                setError('Order not found.');
                return;
            }
            setOrder(orderRes);
            if (orderRes?.status !== 'delivered') {
                setError('Only delivered orders can be returned.');
            }
        }).catch(() => setError('Order not found.'));

        context.setEnableFilterTab(false);
    }, [orderId]);

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.match('image.*')) {
            context.setAlertBox({ open: true, error: true, msg: 'Please select a valid image (JPG/PNG/WebP).' });
            return;
        }
        setUploading(true);
        const fd = new FormData();
        fd.append('image', file);
        try {
            const res = await uploadImage('/api/returns/upload', fd);
            if (res?.url) {
                setProductImageUrl(res.url);
                context.setAlertBox({ open: true, error: false, msg: 'Image uploaded successfully.' });
            } else {
                context.setAlertBox({ open: true, error: true, msg: 'Image upload failed.' });
            }
        } catch (err) {
            context.setAlertBox({ open: true, error: true, msg: 'Image upload failed.' });
        }
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!reason || reason.trim() === '') {
            setError('Please select a reason for return.');
            return;
        }
        if (!productImageUrl || productImageUrl.trim() === '') {
            setError('Product image is mandatory. Please upload an image.');
            return;
        }
        if (!bankName || bankName.trim() === '' || !accountHolderName || accountHolderName.trim() === '' || !accountNumber || accountNumber.trim() === '' || !ifscCode || ifscCode.trim() === '') {
            setError('Bank details are mandatory. Please fill Bank name, Account holder name, Account number and IFSC code.');
            return;
        }
        const user = JSON.parse(localStorage.getItem('user')) || {};
        const userId = user.userId || user.userid;
        if (!userId) {
            setError('Please sign in again.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const data = {
                orderId: orderId,
                userId: userId,
                reason: reason.trim(),
                description: description.trim(),
                productImageUrl: productImageUrl.trim(),
                bankName: bankName.trim(),
                accountHolderName: accountHolderName.trim(),
                accountNumber: accountNumber.trim(),
                ifscCode: ifscCode.trim(),
            };
            const result = await postData('/api/returns', data);
            if (result && result._id) {
                context.setAlertBox({ open: true, error: false, msg: 'Return request submitted successfully.' });
                history('/my-returns');
                return;
            }
            const errMsg = (result && result.msg) ? result.msg : 'Failed to create return request. Please try again.';
            setError(errMsg);
        } catch (err) {
            setError(err?.message || 'Something went wrong. Please try again.');
        }
        setSubmitting(false);
    };

    if (!order && !error) {
        return (
            <section className="section">
                <div className="container text-center py-5">
                    <CircularProgress />
                    <p className="mt-3">Loading order details...</p>
                </div>
            </section>
        );
    }

    if (error && !order) {
        return (
            <section className="section">
                <div className="container">
                    <div className="alert alert-danger">{error}</div>
                    <Button variant="contained" className="btn-blue" onClick={() => history('/orders')}>
                        Back to Orders
                    </Button>
                </div>
            </section>
        );
    }

    if (order?.status !== 'delivered') {
        return (
            <section className="section">
                <div className="container">
                    <div className="alert alert-warning">Only delivered orders can be returned.</div>
                    <Button variant="contained" className="btn-blue" onClick={() => history('/orders')}>
                        Back to Orders
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="section">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <h2 className="hd">Return Request</h2>
                        <p className="text-muted mb-4">
                            Submit a return request for your delivered order. We&apos;ll review it and update you by email.
                        </p>

                        <div className="mb-3">
                            <div className="d-inline-flex align-items-center px-3 py-1 rounded-pill bg-light border">
                                <span className="small text-muted mr-2">Order</span>
                                <span style={{ fontFamily: 'Courier New, monospace' }}>
                                    {formatOrderId(order?._id || orderId)}
                                </span>
                                <span className="mx-2 text-muted">•</span>
                                <span className="small text-muted">Amount</span>
                                <span className="ml-1 font-weight-semibold">₹{order?.amount || ''}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="card border-0 shadow p-4">
                            <h5 className="mb-3">Order details (read-only)</h5>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <TextField fullWidth label="Order ID" variant="outlined" value={formatOrderId(order?._id || orderId)} disabled className="mb-2" inputProps={{ style: { fontFamily: 'Courier New, monospace' } }} />
                                </div>
                                <div className="col-md-6">
                                    <TextField fullWidth label="Payment ID" variant="outlined" value={formatPaymentId(order?.paymentId)} disabled className="mb-2" inputProps={{ style: { fontFamily: 'Courier New, monospace' } }} />
                                </div>
                                <div className="col-md-6">
                                    <TextField fullWidth label="Amount" variant="outlined" value={order?.amount || ''} disabled className="mb-2" />
                                </div>
                                <div className="col-md-6">
                                    <TextField fullWidth label="Status" variant="outlined" value={order?.status || ''} disabled className="mb-2" />
                                </div>
                            </div>

                            <hr className="my-4" />

                            <h5 className="mb-3">Return details</h5>
                            <FormControl fullWidth className="mb-3" required>
                                <InputLabel>Reason for return</InputLabel>
                                <Select
                                    value={reason}
                                    label="Reason for return"
                                    onChange={(e) => setReason(e.target.value)}
                                >
                                    {RETURN_REASONS.map((r) => (
                                        <MenuItem key={r} value={r}>{r}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Description (optional)"
                                variant="outlined"
                                multiline
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mb-3"
                                placeholder="Share any extra details that will help us process your return."
                            />

                            <hr className="my-4" />

                            <h5 className="mb-3">Bank details for refund (mandatory)</h5>
                            <p className="text-muted small mb-3">
                                Enter your bank account details to receive the refund. All fields below are required.
                            </p>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <TextField fullWidth required label="Bank name" variant="outlined" value={bankName} onChange={(e) => setBankName(e.target.value)} className="mb-2" placeholder="e.g. State Bank of India" />
                                </div>
                                <div className="col-md-6">
                                    <TextField fullWidth required label="Account holder name" variant="outlined" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} className="mb-2" placeholder="Name as in bank account" />
                                </div>
                                <div className="col-md-6">
                                    <TextField fullWidth required label="Account number" variant="outlined" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mb-2" placeholder="Bank account number" inputProps={{ inputMode: 'numeric' }} />
                                </div>
                                <div className="col-md-6">
                                    <TextField fullWidth required label="IFSC code" variant="outlined" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} className="mb-2" placeholder="e.g. SBIN0001234" inputProps={{ style: { textTransform: 'uppercase' }, maxLength: 11 }} />
                                </div>
                            </div>

                            <hr className="my-4" />

                            <div className="mb-4">
                                <InputLabel className="mb-2">Product image (mandatory)</InputLabel>
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <div className="border rounded p-3 text-center" style={{ minWidth: 140, minHeight: 140 }}>
                                        {productImageUrl ? (
                                            <img src={productImageUrl} alt="Return product" style={{ maxWidth: 120, maxHeight: 120, objectFit: 'cover' }} />
                                        ) : (
                                            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                                {uploading ? (
                                                    <CircularProgress size={24} />
                                                ) : (
                                                    <>
                                                        <IoMdCloudUpload size={32} className="text-muted mb-2" />
                                                        <span className="small text-muted">Upload image</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={uploading}
                                            style={{ display: 'block', marginTop: 8 }}
                                        />
                                        <span className="small text-muted">JPG, PNG or WebP. Required for return.</span>
                                    </div>
                                </div>
                            </div>

                            {error && <div className="alert alert-danger mb-3">{error}</div>}

                            <div className="d-flex gap-2">
                                <Button type="submit" variant="contained" className="btn-blue bg-red" disabled={submitting}>
                                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Return Request'}
                                </Button>
                                <Button type="button" variant="outlined" onClick={() => history('/my-returns')}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReturnRequestForm;
