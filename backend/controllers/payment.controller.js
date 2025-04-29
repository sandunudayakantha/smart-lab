import Stripe from 'stripe';
import Invoice from '../models/invoiceModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, invoiceId } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: "usd",
            metadata: {
                invoiceId: invoiceId
            }
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
};

export const handlePaymentSuccess = async (req, res) => {
    try {
        const { invoiceId, paymentId } = req.body;

        // Update invoice with payment status
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            invoiceId,
            {
                paymentStatus: 'Paid',
                stripePaymentId: paymentId,
                status: 'Paid'
            },
            { new: true }
        );

        res.status(200).json(updatedInvoice);
    } catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).json({ error: error.message });
    }
};

export const handlePaymentFailure = async (req, res) => {
    try {
        const { invoiceId } = req.body;

        // Update invoice with failed payment status
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            invoiceId,
            {
                paymentStatus: 'Failed'
            },
            { new: true }
        );

        res.status(200).json(updatedInvoice);
    } catch (error) {
        console.error('Error handling payment failure:', error);
        res.status(500).json({ error: error.message });
    }
}; 