const { ReturnRequest } = require('../models/returnRequest');
const { Orders } = require('../models/orders');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { sendEmail } = require('../utils/emailService');
const {
    buildReturnConfirmedEmail,
    buildRefundInitiatedEmail,
    buildRefundInvoiceHtml,
    buildReturnRequestedEmail,
} = require('../utils/emailTemplates');

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `return_${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({ storage });

// Upload return product image to Cloudinary (single image, mandatory for return)
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, msg: 'No image file provided' });
        }
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };
        const result = await cloudinary.uploader.upload(req.file.path, options);
        fs.unlinkSync(req.file.path);
        return res.status(200).json({ success: true, url: result.secure_url });
    } catch (error) {
        console.log(error);
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        return res.status(500).json({ success: false, msg: 'Image upload failed' });
    }
});

// Get all return requests (Admin)
router.get('/', async (req, res) => {
    try {
        const returnsList = await ReturnRequest.find().populate('orderId').sort({ date: -1 });
        if (!returnsList) {
            return res.status(500).json({ success: false });
        }
        return res.status(200).json(returnsList);
    } catch (error) {
        return res.status(500).json({ success: false });
    }
});

// Get return requests by user (Customer - My Returns)
router.get('/user/:userId', async (req, res) => {
    try {
        const returnsList = await ReturnRequest.find({ userId: req.params.userId })
            .populate('orderId')
            .sort({ date: -1 });
        if (!returnsList) {
            return res.status(500).json({ success: false });
        }
        return res.status(200).json(returnsList);
    } catch (error) {
        return res.status(500).json({ success: false });
    }
});

// Check if order already has a return request (to prevent duplicate)
router.get('/check/:orderId', async (req, res) => {
    try {
        const existing = await ReturnRequest.findOne({ orderId: req.params.orderId });
        return res.status(200).json({ exists: !!existing });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
});

// Refund invoice (must be before /:id)
router.get('/:id/invoice', async (req, res) => {
    try {
        const returnReq = await ReturnRequest.findById(req.params.id).populate('orderId');
        if (!returnReq) {
            return res.status(404).send('<html><body><p>Return not found.</p></body></html>');
        }
        const html = buildRefundInvoiceHtml(returnReq);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
    } catch (error) {
        console.log('Refund invoice error:', error);
        return res.status(500).send('<html><body><p>Failed to generate refund invoice.</p></body></html>');
    }
});

// Get single return by id
router.get('/:id', async (req, res) => {
    try {
        const returnReq = await ReturnRequest.findById(req.params.id).populate('orderId');
        if (!returnReq) {
            return res.status(404).json({ message: 'Return request not found.' });
        }
        return res.status(200).send(returnReq);
    } catch (error) {
        return res.status(500).json({ success: false });
    }
});

// Create return request (Customer)
router.post('/', async (req, res) => {
    try {
        const orderId = req.body.orderId ? String(req.body.orderId).trim() : '';
        const userId = req.body.userId ? String(req.body.userId).trim() : '';
        if (!orderId || !userId) {
            return res.status(400).json({ success: false, msg: 'Order ID and User ID are required' });
        }
        const order = await Orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, msg: 'Order not found' });
        }
        if (String(order.status).toLowerCase() !== 'delivered') {
            return res.status(400).json({ success: false, msg: 'Only delivered orders can be returned' });
        }
        const productImageUrl = req.body.productImageUrl ? String(req.body.productImageUrl).trim() : '';
        const reason = req.body.reason ? String(req.body.reason).trim() : '';
        if (!productImageUrl) {
            return res.status(400).json({ success: false, msg: 'Product image is required' });
        }
        if (!reason) {
            return res.status(400).json({ success: false, msg: 'Reason for return is required' });
        }
        const bankName = req.body.bankName ? String(req.body.bankName).trim() : '';
        const accountHolderName = req.body.accountHolderName ? String(req.body.accountHolderName).trim() : '';
        const accountNumber = req.body.accountNumber ? String(req.body.accountNumber).trim() : '';
        const ifscCode = req.body.ifscCode ? String(req.body.ifscCode).trim() : '';
        if (!bankName || !accountHolderName || !accountNumber || !ifscCode) {
            return res.status(400).json({ success: false, msg: 'Bank details are mandatory. Please provide Bank name, Account holder name, Account number and IFSC code.' });
        }
        const bankDetails = { bankName, accountHolderName, accountNumber, ifscCode };
        const returnReq = new ReturnRequest({
            orderId: orderId,
            userId: userId,
            customerName: order.name || '',
            customerEmail: order.email || '',
            customerPhone: order.phoneNumber || '',
            orderDetails: {
                amount: order.amount || '',
                paymentId: order.paymentId || '',
                products: Array.isArray(order.products) ? order.products : [],
            },
            reason: reason,
            description: req.body.description ? String(req.body.description).trim() : '',
            productImageUrl: productImageUrl,
            bankDetails: bankDetails,
            status: 'Pending',
        });

        const saved = await returnReq.save();

        // Best-effort email: Return request placed
        try {
            if (saved.customerEmail) {
                const emailPayload = buildReturnRequestedEmail(saved);
                if (emailPayload) {
                    sendEmail(
                        saved.customerEmail,
                        emailPayload.subject,
                        emailPayload.text,
                        emailPayload.html
                    ).catch(() => { });
                }
            }
        } catch (e) {
            console.log('Return request placed email error:', e?.message || e);
        }

        return res.status(201).json(saved);
    } catch (error) {
        console.error('Return create error:', error);
        const msg = (error && error.message) ? error.message : 'Failed to create return request';
        return res.status(500).json({ success: false, msg });
    }
});

// Update return status (Admin)
router.put('/:id', async (req, res) => {
    try {
        const validStatuses = ['Pending', 'Confirmed', 'Picked Up', 'Refund Initiated'];
        if (!req.body.status || !validStatuses.includes(req.body.status)) {
            return res.status(400).json({ success: false, msg: 'Invalid status' });
        }
        const prev = await ReturnRequest.findById(req.params.id);
        const returnReq = await ReturnRequest.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!returnReq) {
            return res.status(404).json({ message: 'Return request not found.' });
        }

        // Send notifications for key status changes (best-effort)
        try {
            if (returnReq.customerEmail) {
                if (req.body.status === 'Confirmed') {
                    const emailPayload = buildReturnConfirmedEmail(returnReq);
                    if (emailPayload) {
                        sendEmail(
                            returnReq.customerEmail,
                            emailPayload.subject,
                            emailPayload.text,
                            emailPayload.html
                        ).catch(() => {});
                    }
                }
                if (req.body.status === 'Refund Initiated') {
                    const emailPayload = buildRefundInitiatedEmail({
                        returnReq,
                        refundAmount: returnReq.orderDetails?.amount,
                    });
                    if (emailPayload) {
                        sendEmail(
                            returnReq.customerEmail,
                            emailPayload.subject,
                            emailPayload.text,
                            emailPayload.html
                        ).catch(() => {});
                    }
                }
            }
        } catch (e) {
            console.log('Return status email error:', e?.message || e);
        }

        return res.status(200).send(returnReq);
    } catch (error) {
        return res.status(500).json({ success: false });
    }
});

module.exports = router;
