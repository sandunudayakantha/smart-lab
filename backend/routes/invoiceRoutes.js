import express from 'express';
import {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    getInvoicesByUserId,
    updatePaymentStatus
} from '../controllers/invoiceController.js';

const router = express.Router();

// Invoice routes
router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.get('/user/:userId', getInvoicesByUserId);
router.put('/:id/payment', updatePaymentStatus);

export default router; 