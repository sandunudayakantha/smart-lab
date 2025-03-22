import express from "express";
import Inventory from "../models/Inventory.js"; // Use import instead of require
import ExcelJS from "exceljs"; // Use import instead of require
import PDFDocument from "pdfkit"; // Use import instead of require

const router = express.Router();

// Report generation endpoint
router.post("/", async (req, res) => {
  const { reportType, format } = req.body;

  if (!reportType || !format) {
    return res.status(400).json({ error: "Missing reportType or format" });
  }

  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    const now = new Date();

    switch (reportType) {
      case "inventory":
        format === "pdf"
          ? generatePDF(res, items, "Inventory Levels Report", formatInventoryPDF)
          : generateExcel(res, items, "Inventory Report", formatInventoryExcel);
        break;
      case "expiry":
        format === "pdf"
          ? generatePDF(res, items, "Expiry Report", formatExpiryPDF, now)
          : generateExcel(res, items, "Expiry Report", formatExpiryExcel, now);
        break;
      case "usage":
        format === "pdf"
          ? generatePDF(res, items, "Usage Report", formatUsagePDF)
          : generateExcel(res, items, "Usage Report", formatUsageExcel);
        break;
      default:
        return res.status(400).json({ error: "Invalid report type" });
    }
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Helper function to generate PDF
const generatePDF = (res, items, title, formatter, now) => {
  const doc = new PDFDocument();
  const filename = `${title.toLowerCase().replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  doc.pipe(res);
  doc.fontSize(18).text(title, { align: "center" });
  doc.moveDown();

  formatter(doc, items, now);
  doc.end();
};

// Helper function to generate Excel
const generateExcel = (res, items, title, formatter, now) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);
  const filename = `${title.toLowerCase().replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;

  formatter(worksheet, items, now);

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  workbook.xlsx.write(res).then(() => res.end());
};

// Formatter for inventory PDF
const formatInventoryPDF = (doc, items) => {
  items.forEach((item) => {
    doc
      .fontSize(12)
      .text(`Item: ${item.itemName}`, { continued: true })
      .text(`Quantity: ${item.quantity}`, { align: "right" })
      .moveDown();
  });
};

// Formatter for inventory Excel
const formatInventoryExcel = (worksheet, items) => {
  worksheet.columns = [
    { header: "Item Name", key: "name", width: 30 },
    { header: "Quantity", key: "quantity", width: 15 },
    { header: "Category", key: "category", width: 20 },
  ];
  items.forEach((item) => worksheet.addRow({ name: item.itemName, quantity: item.quantity, category: item.category }));
};

// Formatter for expiry PDF
const formatExpiryPDF = (doc, items, now) => {
  items.forEach((item) => {
    const expiryDate = new Date(item.expirationDate);
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 3600 * 24));
    const status = daysRemaining <= 0 ? "EXPIRED" : daysRemaining <= 30 ? "WARNING" : "OK";

    doc
      .fontSize(12)
      .text(`Item: ${item.itemName}`, { continued: true })
      .text(`Expiry: ${expiryDate.toISOString().split("T")[0]}`, { align: "right" })
      .moveDown()
      .text(`Status: ${status}`, { align: "left" })
      .moveDown();
  });
};

// Formatter for expiry Excel
const formatExpiryExcel = (worksheet, items, now) => {
  worksheet.columns = [
    { header: "Item Name", key: "name", width: 30 },
    { header: "Expiry Date", key: "expiry", width: 15 },
    { header: "Days Remaining", key: "days", width: 15 },
    { header: "Status", key: "status", width: 20 },
  ];
  items.forEach((item) => {
    const expiryDate = new Date(item.expirationDate);
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 3600 * 24));
    const status = daysRemaining <= 0 ? "EXPIRED" : daysRemaining <= 30 ? "WARNING" : "OK";
    worksheet.addRow({ name: item.itemName, expiry: expiryDate.toISOString().split("T")[0], days: daysRemaining, status });
  });
};

// Formatter for usage PDF
const formatUsagePDF = (doc, items) => {
  items.forEach((item) => {
    doc
      .fontSize(12)
      .text(`Item: ${item.itemName}`, { continued: true })
      .text(`Usage: ${item.usage || "N/A"}`, { align: "right" })
      .moveDown();
  });
};

// Formatter for usage Excel
const formatUsageExcel = (worksheet, items) => {
  worksheet.columns = [
    { header: "Item Name", key: "name", width: 30 },
    { header: "Usage", key: "usage", width: 15 },
  ];
  items.forEach((item) => worksheet.addRow({ name: item.itemName, usage: item.usage || "N/A" }));
};

export default router; // Use export default for ES modules