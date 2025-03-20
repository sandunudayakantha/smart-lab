import React, { useState, useEffect } from "react";
import axios from "axios";

const ReportsPage = () => {
  const [reports, setReports] = useState([]); // State to store all reports
  const [filteredReports, setFilteredReports] = useState([]); // State to store filtered reports
  const [activeTab, setActiveTab] = useState("pending"); // State to track active tab
  const [searchQuery, setSearchQuery] = useState(""); // State to store search query

  // Fetch all test reports from the backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:5002/api/testReports");
        setReports(response.data);
        filterReports(response.data, activeTab, searchQuery); // Filter reports based on the active tab and search query
      } catch (error) {
        console.error("Error fetching test reports:", error);
      }
    };

    fetchReports();
  }, []);

  // Filter reports based on the active tab and search query
  const filterReports = (reports, tab, query) => {
    let filtered = reports;

    // Filter by tab (pending or completed)
    if (tab === "pending") {
      filtered = filtered.filter((report) => !report.completeStatus);
    } else if (tab === "completed") {
      filtered = filtered.filter((report) => report.completeStatus);
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (report) =>
          report.patientId.toString().includes(query) || // Search by Patient ID
          report.invoiceId.toString().includes(query) || // Search by Invoice ID
          report.templateId?.templateName.toLowerCase().includes(query.toLowerCase()) // Search by Template Name
      );
    }

    setFilteredReports(filtered);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterReports(reports, tab, searchQuery);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterReports(reports, activeTab, query);
  };

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Test Reports</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Patient ID, Invoice ID, or Template Name"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Tab Buttons */}
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

      {/* Display Test Reports */}
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
                  <td className="p-2">
                  <button
  onClick={() => window.open(`/reports/${report._id}`, '_blank')}
  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
>
  View
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