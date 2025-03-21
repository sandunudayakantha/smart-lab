import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import image from '../../../src/assets/new_amuna.jpg'; // Ensure correct path

const ReportView = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:5002/api/testReports/${id}`);
        setReport(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching report:', error);
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const getTestResult = (templateTest) => {
    if (!report?.testResults) return null;
    return report.testResults.find(tr => tr.testName === templateTest.testName);
  };

  const formatSelectResult = (test, result) => {
    if (test.inputType === 'select' && test.options) {
      return `${result} (${test.options[result] || 'Unknown'})`;
    }
    return result;
  };

  const handlePrint = () => {
    const reportElement = document.getElementById('report-content');
    const buttons = document.querySelectorAll('.screen-only'); // Hide buttons before capturing

    buttons.forEach(button => button.style.display = 'none');

    html2canvas(reportElement, {
      scale: 2,
      backgroundColor: null, // Transparent background
      useCORS: true, // Ensures images are captured correctly
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      buttons.forEach(button => button.style.display = ''); // Restore buttons
      pdf.save(`${report.templateId?.templateName || 'report'}.pdf`);
    });
  };

  const handlePrintReport = () => {
    const reportElement = document.getElementById('report-content');
  
    if (!reportElement) {
      console.error('Report content not found.');
      return;
    }
  
    // Clone the report content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Report</title>
          <style>
            @page {
              margin: 0;
              size: auto;
            }
            @media print {
              body {
                margin: 0;
                padding: 20px;
                background: none !important;
                -webkit-print-color-adjust: exact;
              }
              .no-print {
                display: none;
              }
              .screen-only {
                display: none !important; /* Ensure buttons are hidden */
              }
            }
            body {
              font-family: Arial, sans-serif;
              color: black;
              padding: 20px;
            }
            .report-container {
              width: 100%;
              max-width: 800px;
              margin: auto;
            }
            .table-container table {
              width: 100%;
              border-collapse: collapse;
            }
            .table-container th, .table-container td {
              padding: 8px;
              border: 1px solid black;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="report-container">${reportElement.innerHTML}</div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
  
    printWindow.document.close();
  };
  
  if (loading) return <div>Loading...</div>;
  if (!report) return <div>Report not found</div>;

  return (
    <div>
      {/* Style Section */}
      <style>
        {`
          @media print {
            .screen-only {
              display: none !important;
            }
          }

          #report-content {
            background-image: url(${image});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            padding: 20px;
            border-radius: 10px;
            color: black;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
          }
          
          .a4-sheet {
            width: 100%;
            min-height: 100%;
            padding: 20px;
            border-radius: 10px;
            background: none;
          }
          
          .table-container table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .table-container th, .table-container td {
            padding: 8px;
            border: 1px solid black;
            text-align: left;
          }

          .screen-only {
            margin-top: 10px;
          }
        `}
      </style>

      <div id="report-content" className="p-6 report-container">
        <div className="bg-white p-8 rounded shadow-md a4-sheet">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">{report.templateId?.templateName} Report</h1>
            <div className="flex justify-between mb-6">
              <div className="text-left">
                <p className="font-semibold">Invoice ID: {report.invoiceId}</p>
                <p className="font-semibold">Patient ID: {report.patientId}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Date: {new Date(report.createdAt).toLocaleDateString()}</p>
                <p className="font-semibold">Specimen: {report.templateId?.specimenType}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Result</th>
                  <th>Unit</th>
                  <th>Normal Range</th>
                </tr>
              </thead>
              <tbody>
                {report.templateId?.tests?.map((templateTest, index) => {
                  const testResult = getTestResult(templateTest);
                  return (
                    <tr key={index}>
                      <td>{templateTest.testName}</td>
                      <td className="font-semibold">
                        {testResult ? formatSelectResult(templateTest, testResult.result) : 'N/A'}
                      </td>
                      <td>{testResult?.unit || templateTest.unit}</td>
                      <td>{testResult?.normalRange || templateTest.normalRange}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Description & Comments */}
          <div className="mb-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Description</h2>
              <p className="mb-4">{report.templateId?.description || 'No description provided'}</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Comments</h2>
              <p className="text-gray-700">{report.comment || 'No additional comments'}</p>
            </div>
          </div>

          {/* Extra Notes */}
          <div className="border-t pt-4 space-y-2">
            {report.repeatStatus && (
              <p className="text-red-600 font-semibold">* Repeated and confirmed</p>
            )}
            {report.outSideStatus && (
              <p className="text-red-600 font-semibold">* Sample received from outside</p>
            )}
          </div>
        </div>

        {/* Non-printable Buttons */}
        <div className="screen-only mt-4">
          <button 
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 screen-only"
          >
            Download PDF
          </button>
          <button 
            onClick={handlePrintReport}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 screen-only ml-2"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportView;

//jjjjjj