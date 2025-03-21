import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./lib/db.js";

import inventoryRoutes from "./routes/inventoryRoutes.js";
import testTemplateRoutes from "./routes/testTemplate.route.js";
import testReportRoutes from "./routes/testReport.route.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import reportRoutes from "./routes/reports.js";

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5174", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/testTemplates", testTemplateRoutes);
app.use("/api/testReports", testReportRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is working!");
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(); // Connect to the database
});