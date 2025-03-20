import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'


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

  //const handlePrint = () => {
  //  window.print();
  //};

  const handlePrint = () => {
    const reportElement = document.getElementById('report-content');
    const buttons = document.querySelectorAll('.screen-only'); // Select buttons to hide
  
    // Hide buttons before capturing
    buttons.forEach(button => button.style.display = 'none');
  
    html2canvas(reportElement, {
      scale: 2,
      backgroundColor: null // Ensures transparent background
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait mode, A4 size
  
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
  
      // Draw background image first
      const backgroundImage = 'your-background-image-url.jpg'; // Change to your image URL
      pdf.addImage(backgroundImage, 'JPEG', 0, 0, imgWidth, imgHeight);
  
      // Add report content on top of background
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  
      // Restore buttons after capture
      buttons.forEach(button => button.style.display = '');
  
      // Save PDF
      pdf.save(`${report.templateId?.templateName || 'report'}.pdf`);
    });
  };
  
  const handleDirectPrint = () => {
    const reportElement = document.getElementById('report-content');
    const buttons = document.querySelectorAll('.screen-only'); // Select buttons to hide
  
    // Hide buttons before capturing
    buttons.forEach(button => button.style.display = 'none');
  
    html2canvas(reportElement, {
      scale: 2,
      backgroundColor: '#ffffff' // Ensures plain white background
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait mode, A4 size
  
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
  
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  
      // Restore buttons after capture
      buttons.forEach(button => button.style.display = '');
  
      // Open the PDF in a new tab instead of saving
      window.open(pdf.output('bloburl'), '_blank');
    });
  };
  
  




  if (loading) return <div>Loading...</div>;
  if (!report) return <div>Report not found</div>;

  return (
    <div id="report-content" className="p-6 report-container">
      

      {/* Printable Area */}
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

        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Test Name</th>
              <th className="p-2 border">Result</th>
              <th className="p-2 border">Unit</th>
              <th className="p-2 border">Normal Range</th>
            </tr>
          </thead>
          <tbody>
            {report.templateId?.tests?.map((templateTest, index) => {
              const testResult = getTestResult(templateTest);
              return (
                <tr key={index} className="border-b">
                  <td className="p-2 border">{templateTest.testName}</td>
                  <td className="p-2 border font-semibold">
                    {testResult ? 
                      formatSelectResult(templateTest, testResult.result) : 
                      'N/A'}
                  </td>
                  <td className="p-2 border">{testResult?.unit || templateTest.unit}</td>
                  <td className="p-2 border">{testResult?.normalRange || templateTest.normalRange}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

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

        <div className="border-t pt-4 space-y-2">
          {report.repeatStatus && (
            <p className="text-red-600 font-semibold">* Repeated and confirmed</p>
          )}
          {report.outSideStatus && (
            <p className="text-red-600 font-semibold">* Sample received from outside</p>
          )}
        </div>
      </div>

      {/* Non-printable Button */}
      <div className="screen-only mt-4">
      <button 
  onClick={handlePrint}
  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 screen-only"
>
  Download PDF
</button>

<button 
    onClick={handleDirectPrint}
    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 screen-only"
  >
    Print Report
  </button>


      </div>
    </div>
  );
};

export default ReportView;
