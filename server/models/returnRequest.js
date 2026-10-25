const mongoose = require('mongoose');

const returnRequestSchema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Orders',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    orderDetails: {
        amount: { type: String },
        paymentId: { type: String },
        products: [{
            productId: { type: String },
            productTitle: { type: String },
            quantity: { type: Number },
            price: { type: Number },
            image: { type: String },
            subTotal: { type: Number }
        }]
    },
    reason: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    productImageUrl: {
        type: String,
        required: true
    },
    bankDetails: {
        bankName: { type: String, default: '' },
        accountHolderName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        ifscCode: { type: String, default: '' }
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Picked Up', 'Refund Initiated'],
        default: 'Pending'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

returnRequestSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

returnRequestSchema.set('toJSON', {
    virtuals: true,
});

exports.ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
exports.returnRequestSchema = returnRequestSchema;
