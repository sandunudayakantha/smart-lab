import Inventory from '../models/Inventory.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Generate inventory report
export const generateInventoryReport = async (req, res, type, format) => {
  try {
    console.log('Generating report:', { type, format });
    let items = [];

    // Filter items based on report type
    switch (type) {
      case 'low-stock':
        items = await Inventory.find({
          $expr: { $lte: ['$quantity', '$minStockLevel'] }
        });
        break;
      case 'expired':
        items = await Inventory.find({
          expirationDate: { $lt: new Date() }
        });
        break;
      case 'expiring':
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        items = await Inventory.find({
          expirationDate: {
            $gte: new Date(),
            $lte: thirtyDaysFromNow
          }
        });
        break;
      case 'inventory':
      default:
        items = await Inventory.find();
    }

    console.log(`Found ${items.length} items for report type: ${type}`);

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inventory Report');

      // Add headers
      worksheet.columns = [
        { header: 'Item Code', key: 'itemCode', width: 15 },
        { header: 'Item Name', key: 'itemName', width: 30 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 15 },
        { header: 'Min Stock', key: 'minStockLevel', width: 15 },
        { header: 'Unit', key: 'unit', width: 10 },
        { header: 'Expiration Date', key: 'expirationDate', width: 15 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Supplier', key: 'supplier', width: 20 }
      ];

      // Add data
      items.forEach(item => {
        worksheet.addRow({
          itemCode: item.itemCode,
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          minStockLevel: item.minStockLevel,
          unit: item.unit,
          expirationDate: item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A',
          location: item.location || 'N/A',
          supplier: item.supplier || 'N/A'
        });
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_report.xlsx`);

      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } else {
      // Generate PDF report
      const doc = new PDFDocument();
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_report.pdf`);

      // Pipe PDF to response
      doc.pipe(res);

      // Add title
      doc.fontSize(20).text('Inventory Report', { align: 'center' });
      doc.moveDown();

      // Add report type
      doc.fontSize(14).text(`Report Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`, { align: 'left' });
      doc.moveDown();

      // Add table headers
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidth = 100;
      const rowHeight = 30;

      // Draw table headers
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .text('Item Code', tableLeft, tableTop)
        .text('Item Name', tableLeft + colWidth, tableTop)
        .text('Category', tableLeft + colWidth * 2, tableTop)
        .text('Quantity', tableLeft + colWidth * 3, tableTop)
        .text('Min Stock', tableLeft + colWidth * 4, tableTop)
        .text('Expiration', tableLeft + colWidth * 5, tableTop);

      // Draw table rows
      let y = tableTop + rowHeight;
      doc.font('Helvetica').fontSize(10);

      items.forEach(item => {
        doc.text(item.itemCode, tableLeft, y)
          .text(item.itemName, tableLeft + colWidth, y)
          .text(item.category, tableLeft + colWidth * 2, y)
          .text(String(item.quantity), tableLeft + colWidth * 3, y)
          .text(String(item.minStockLevel), tableLeft + colWidth * 4, y)
          .text(item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A', 
                tableLeft + colWidth * 5, y);
        y += rowHeight;
      });

      // Finalize PDF
      doc.end();
    }
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ 
      message: 'Error generating report',
      error: err.message 
    });
  }
}; 