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
import Invoice from '../models/invoice.js';

const router = express.Router();

// Invoice routes
router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.get('/user/:userId', getInvoicesByUserId);
router.put('/:id/payment', updatePaymentStatus);

// Route to mark a template as completed in an invoice
router.put('/:invoiceId/complete-template', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { templateId } = req.body;

    console.log('Completing template:', {
      invoiceId,
      templateId,
      requestBody: req.body
    });

    // Find the invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      console.log('Invoice not found:', invoiceId);
      return res.status(404).json({ message: 'Invoice not found' });
    }

    console.log('Found invoice:', {
      invoiceId: invoice._id,
      testTemplates: invoice.testTemplates,
      currentStatus: invoice.status
    });

    // Find the template in testTemplates array
    const templateIndex = invoice.testTemplates.findIndex(t => t._id.toString() === templateId);
    console.log('Template index:', templateIndex);
    
    if (templateIndex === -1) {
      console.log('Template not found in invoice:', templateId);
      return res.status(404).json({ message: 'Template not found in invoice' });
    }

    // Mark the template as completed
    invoice.testTemplates[templateIndex].completed = true;
    console.log('Marked template as completed:', invoice.testTemplates[templateIndex]);

    // Check if all templates are completed
    const allCompleted = invoice.testTemplates.every(t => t.completed);
    console.log('All templates completed:', allCompleted);
    
    if (allCompleted) {
      invoice.status = 'Completed';
      console.log('Marked invoice as completed');
    }

    // Save the invoice
    const updatedInvoice = await invoice.save();
    console.log('Saved invoice:', {
      status: updatedInvoice.status,
      testTemplates: updatedInvoice.testTemplates.map(t => ({
        _id: t._id,
        name: t.name,
        completed: t.completed
      }))
    });
    
    res.json(updatedInvoice);
  } catch (error) {
    console.error('Error completing template:', error);
    res.status(500).json({ message: 'Error completing template' });
  }
});

export default router; 