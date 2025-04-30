const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  paymentType: {
    type: String,
    enum: ['Cash', 'Card', 'Online'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Completed'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  testTemplates: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestTemplate',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }]
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice; 