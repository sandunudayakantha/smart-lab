import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    testTemplates: [{
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TestTemplate',
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    }],
    paymentType: {
        type: String,
        enum: ['Cash', 'Card', 'Online'],
        default: 'Cash'
    },
    amount: {
        type: Number,
        required: true
    },
    payingAmount: {
        type: Number,
        required: true
    },
    dueAmount: {
        type: Number,
        required: true
    },
    notes: String,
    isFullPayment: {
        type: Boolean,
        default: false
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Partial', 'Completed'],
        default: 'Pending'
    },
    stripePaymentId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

const invoiceModel = mongoose.models.invoice || mongoose.model('invoice', invoiceSchema);

export default invoiceModel; 