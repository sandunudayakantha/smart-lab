import express from 'express';
import {
    createInvoice,
    getInvoices,
    getInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoicesByUserId,
    updatePayment,
    completeTest
} from '../controllers/invoiceController.js';
import Invoice from '../models/invoice.js';

const router = express.Router();

// Invoice routes
router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.get('/user/:userId', getInvoicesByUserId);
router.put('/:id/payment', updatePayment);
router.put('/:invoiceId/complete-test/:templateId', completeTest);

// Route to mark a template as completed in an invoice
router.put('/:invoiceId/complete-template', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { templateId } = req.body;

    // Find the invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Find the template in testTemplates array
    const templateIndex = invoice.testTemplates.findIndex(t => t._id.toString() === templateId);
    if (templateIndex === -1) {
      return res.status(404).json({ message: 'Template not found in invoice' });
    }

    // Mark the template as completed
    invoice.testTemplates[templateIndex].completed = true;

    // Check if all templates are completed
    const allCompleted = invoice.testTemplates.every(t => t.completed);
    if (allCompleted) {
      invoice.status = 'Completed';
    }

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    console.error('Error completing template:', error);
    res.status(500).json({ message: 'Error completing template' });
  }
});

export default router; 