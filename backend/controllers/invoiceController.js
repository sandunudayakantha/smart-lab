import Invoice from '../models/invoiceModel.js';
import axios from 'axios';

// Create a new invoice
export const createInvoice = async (req, res) => {
    try {
        const { userId, testTemplates, ...otherData } = req.body;
        
        // Transform testTemplates array to include templateId and completed status
        const transformedTestTemplates = testTemplates.map(templateId => ({
            templateId,
            completed: false
        }));
        
        const invoice = new Invoice({
            userId,
            testTemplates: transformedTestTemplates,
            ...otherData
        });
        
        const savedInvoice = await invoice.save();
        const populatedInvoice = await Invoice.findById(savedInvoice._id)
            .populate('userId', 'title name email phone')
            .populate('testTemplates.templateId', 'templateName shortName price category');
            
        res.status(201).json(populatedInvoice);
    } catch (error) {
        console.error('Error in createInvoice:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get all invoices
export const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .populate('userId', 'title name email phone')
            .populate('testTemplates.templateId', 'templateName shortName price category');
        
        res.status(200).json(invoices);
    } catch (error) {
        console.error('Error in getInvoices:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get a single invoice
export const getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('userId', 'title name email phone')
            .populate('testTemplates.templateId', 'templateName shortName price category');
            
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        
        res.status(200).json(invoice);
    } catch (error) {
        console.error('Error in getInvoice:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update an invoice
export const updateInvoice = async (req, res) => {
    try {
        const { testTemplates, ...otherData } = req.body;
        
        // If testTemplates are being updated, transform them
        let updateData = otherData;
        if (testTemplates) {
            updateData.testTemplates = testTemplates.map(templateId => ({
                templateId,
                completed: false
            }));
        }
        
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
        .populate('userId', 'title name email phone')
        .populate('testTemplates.templateId', 'templateName shortName price category');
        
        if (!updatedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        
        res.status(200).json(updatedInvoice);
    } catch (error) {
        console.error('Error in updateInvoice:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete an invoice
export const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        
        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Error in deleteInvoice:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get invoices by user ID
export const getInvoicesByUserId = async (req, res) => {
    try {
        const invoices = await Invoice.find({ userId: req.params.userId })
            .populate('userId', 'title name email phone')
            .populate('testTemplates.templateId', 'templateName shortName price category');
            
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update invoice payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { amountPaid } = req.body;
        const invoice = await Invoice.findById(req.params.id);
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const remainingAmount = invoice.amount - amountPaid;
        let status = 'Paid';
        
        if (remainingAmount > 0) {
            status = 'Partial';
        }

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            {
                dueAmount: remainingAmount,
                paymentStatus: status
            },
            { new: true }
        ).populate('userId', 'title name email phone')
         .populate('testTemplates.templateId', 'templateName shortName price category');
         
        res.status(200).json(updatedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mark a test as completed
export const completeTest = async (req, res) => {
    try {
        const { invoiceId, templateId } = req.params;
        
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        
        // Find and update the test template's completed status
        const testTemplate = invoice.testTemplates.find(
            test => test.templateId.toString() === templateId
        );
        
        if (!testTemplate) {
            return res.status(404).json({ message: 'Test template not found in invoice' });
        }
        
        testTemplate.completed = true;
        
        // Check if all tests are completed
        const allCompleted = invoice.testTemplates.every(test => test.completed);
        if (allCompleted) {
            invoice.paymentStatus = 'Completed';
        }
        
        await invoice.save();
        
        const updatedInvoice = await Invoice.findById(invoiceId)
            .populate('userId', 'title name email phone')
            .populate('testTemplates.templateId', 'templateName shortName price category');
            
        res.status(200).json(updatedInvoice);
    } catch (error) {
        console.error('Error in completeTest:', error);
        res.status(500).json({ message: error.message });
    }
}; 