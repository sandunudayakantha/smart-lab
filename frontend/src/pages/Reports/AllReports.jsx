import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:5002/api/testReports");
        setReports(response.data);
        filterReports(response.data, activeTab, searchQuery);
      } catch (error) {
        console.error("Error fetching test reports:", error);
      }
    };

    fetchReports();
  }, []);

  const filterReports = (reports, tab, query) => {
    let filtered = reports;

    if (tab === "pending") {
      filtered = filtered.filter((report) => !report.completeStatus);
    } else if (tab === "completed") {
      filtered = filtered.filter((report) => report.completeStatus);
    }

    if (query) {
      filtered = filtered.filter(
        (report) =>
          report.patientId.toString().includes(query) ||
          report.invoiceId.toString().includes(query) ||
          report.templateId?.templateName.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterReports(reports, tab, searchQuery);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterReports(reports, activeTab, query);
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(`http://localhost:5002/api/testReports/${reportId}`);
      setReports(reports.filter((report) => report._id !== reportId));
      filterReports(reports.filter((report) => report._id !== reportId), activeTab, searchQuery);
      alert("Report deleted successfully!");
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleUpdateReport = (reportId) => {
    navigate(`/update-report/${reportId}`);
  };

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Test Reports</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Patient ID, Invoice ID, or Template Name"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handleTabChange("pending")}
          className={`px-4 py-2 rounded ${
            activeTab === "pending"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => handleTabChange("completed")}
          className={`px-4 py-2 rounded ${
            activeTab === "completed"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Completed
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">
          {activeTab === "pending" ? "Pending Reports" : "Completed Reports"}
        </h2>
        {filteredReports.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Patient ID</th>
                <th className="p-2 text-left">Invoice ID</th>
                <th className="p-2 text-left">Template</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report._id} className="border-b">
                  <td className="p-2">{report.patientId}</td>
                  <td className="p-2">{report.invoiceId}</td>
                  <td className="p-2">{report.templateId?.templateName}</td>
                  <td className="p-2">
                    {report.completeStatus ? "Completed" : "Pending"}
                  </td>
                  <td className="p-2 flex space-x-2">
                    <button
                      onClick={() => window.open(`/reports/${report._id}`, '_blank')}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleUpdateReport(report._id)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No {activeTab === "pending" ? "pending" : "completed"} reports found.</p>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;