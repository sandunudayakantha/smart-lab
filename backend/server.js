import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./lib/db.js";

import inventoryRoutes from "./routes/inventoryRoutes.js";
import testTemplateRoutes from "./routes/testTemplate.routes.js";
import testReportRoutes from "./routes/testReport.route.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import reportRoutes from "./routes/reports.js";
import userRoutes from "./routes/userRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import paymentRoutes from './routes/payment.routes.js';

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware
/*app.use(
    cors({
      origin: "http://localhost:5174/dashboard", // Replace with your frontend URL
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );*/

  app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Test route
app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Test route working' });
});

// Routes
app.use("/api/testTemplates", testTemplateRoutes);
app.use("/api/testReports", testReportRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use('/api/payments', paymentRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is working!");
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(); // Connect to the database
});