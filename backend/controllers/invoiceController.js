import invoiceModel from '../models/invoiceModel.js';

// Create a new invoice
export const createInvoice = async (req, res) => {
    try {
        const newInvoice = new invoiceModel(req.body);
        const savedInvoice = await newInvoice.save();
        res.status(201).json(savedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all invoices
export const getInvoices = async (req, res) => {
    try {
        const invoices = await invoiceModel.find()
            .populate('userId', 'name email phone title gender age')
            .populate('testTemplates', 'name price')
            .populate('testTemplateId', 'name price');
        
        // Transform the data to ensure test details are available
        const transformedInvoices = invoices.map(invoice => {
            if (invoice.testTemplateId && (!invoice.testTemplates || invoice.testTemplates.length === 0)) {
                return {
                    ...invoice.toObject(),
                    testTemplates: [invoice.testTemplateId]
                };
            }
            return invoice;
        });
        
        res.status(200).json(transformedInvoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get a single invoice by ID
export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await invoiceModel.findById(req.params.id)
            .populate('userId', 'name email phone title gender age')
            .populate('testTemplates', 'name price')
            .populate('testTemplateId', 'name price');
            
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        
        // Transform the data to ensure test details are available
        let transformedInvoice = invoice.toObject();
        if (invoice.testTemplateId && (!invoice.testTemplates || invoice.testTemplates.length === 0)) {
            transformedInvoice.testTemplates = [invoice.testTemplateId];
        }
        
        res.status(200).json(transformedInvoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an invoice
export const updateInvoice = async (req, res) => {
    try {
        const updatedInvoice = await invoiceModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('userId', 'name email phone title gender age')
         .populate('testTemplates', 'name price')
         .populate('testTemplateId', 'name price');
        
        if (!updatedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        
        // Transform the data to ensure test details are available
        let transformedInvoice = updatedInvoice.toObject();
        if (updatedInvoice.testTemplateId && (!updatedInvoice.testTemplates || updatedInvoice.testTemplates.length === 0)) {
            transformedInvoice.testTemplates = [updatedInvoice.testTemplateId];
        }
        
        res.status(200).json(transformedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an invoice
export const deleteInvoice = async (req, res) => {
    try {
        const deletedInvoice = await invoiceModel.findByIdAndDelete(req.params.id);
        if (!deletedInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get invoices by user ID
export const getInvoicesByUserId = async (req, res) => {
    try {
        const invoices = await invoiceModel.find({ userId: req.params.userId })
            .populate('userId', 'name email phone title gender age')
            .populate('testTemplates', 'name price')
            .populate('testTemplateId', 'name price');
            
        // Transform the data to ensure test details are available
        const transformedInvoices = invoices.map(invoice => {
            if (invoice.testTemplateId && (!invoice.testTemplates || invoice.testTemplates.length === 0)) {
                return {
                    ...invoice.toObject(),
                    testTemplates: [invoice.testTemplateId]
                };
            }
            return invoice;
        });
        
        res.status(200).json(transformedInvoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update invoice payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { amountPaid } = req.body;
        const invoice = await invoiceModel.findById(req.params.id);
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const remainingAmount = invoice.amount - amountPaid;
        let status = 'Paid';
        
        if (remainingAmount > 0) {
            status = 'Partial';
        }

        const updatedInvoice = await invoiceModel.findByIdAndUpdate(
            req.params.id,
            {
                dueAmount: remainingAmount,
                paymentStatus: status
            },
            { new: true }
        ).populate('userId', 'name email phone title gender age')
         .populate('testTemplates', 'name price')
         .populate('testTemplateId', 'name price');
         
        // Transform the data to ensure test details are available
        let transformedInvoice = updatedInvoice.toObject();
        if (updatedInvoice.testTemplateId && (!updatedInvoice.testTemplates || updatedInvoice.testTemplates.length === 0)) {
            transformedInvoice.testTemplates = [updatedInvoice.testTemplateId];
        }

        res.status(200).json(transformedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 