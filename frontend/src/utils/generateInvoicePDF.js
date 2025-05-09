import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (invoice, user, tests) => {
    const doc = new jsPDF();
    
    // Add logo or header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice._id}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 50);
    
    // Add user details
    doc.text('Customer Details:', 20, 70);
    doc.text(`${user.title} ${user.name}`, 20, 80);
    doc.text(`Gender: ${user.gender}`, 20, 90);
    doc.text(`Age: ${user.age.years} years ${user.age.months} months`, 20, 100);
    doc.text(`Phone: ${user.phone}`, 20, 110);
    doc.text(`Email: ${user.email}`, 20, 120);
    doc.text(`Address: ${user.address}`, 20, 130);
    
    // Add test details table
    const tableColumn = ["Test Name", "Short Name", "Price"];
    const tableRows = tests.map(test => [
        test.templateName,
        test.shortName,
        `Rs. ${test.price}`
    ]);
    
    autoTable(doc, {
        startY: 150,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 }
    });
    
    // Add payment details in a table format
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.text('Payment Details:', 20, finalY);
    
    const paymentRows = [
        ['Payment Type:', invoice.paymentType, ''],
        ['Total Amount:', 'Rs.', invoice.amount.toFixed(2)],
        ['Amount Paid:', 'Rs.', invoice.payingAmount.toFixed(2)],
        ['Due Amount:', 'Rs.', invoice.dueAmount.toFixed(2)],
        ['Payment Status:', invoice.paymentStatus, '']
    ];
    
    autoTable(doc, {
        startY: finalY + 10,
        body: paymentRows,
        theme: 'plain',
        styles: { fontSize: 11 },
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 30, halign: 'right' },
            2: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: 20 },
        tableWidth: 'auto'
    });
    
    // Add footer
    doc.setFontSize(10);
    doc.text('Thank you for your business!', 105, doc.internal.pageSize.height - 20, { align: 'center' });
    
    return doc;
}; 