import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    testTemplateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'testTemplate',
        required: true
    },
    paymentType: {
        type: String,
        enum: ["Cash", "Card", "Bank Transfer", "Online Payment"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["Pending", "Paid", "Partially Paid", "Overdue"],
        default: "Pending"
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const invoiceModel = mongoose.models.invoice || mongoose.model('invoice', invoiceSchema);

export default invoiceModel; 