import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    testTemplates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestTemplate',
        required: true
    }],
    paymentType: {
        type: String,
        enum: ["Cash", "Card", "Bank Transfer", "Online Payment"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    payingAmount: {
        type: Number,
        required: true,
        default: 0
    },
    dueAmount: {
        type: Number,
        required: true,
        default: 0
    },
    notes: {
        type: String,
        default: ""
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Partial", "Failed"],
        default: "Pending"
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