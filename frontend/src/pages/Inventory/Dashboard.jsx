import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Dashboard.css"; // Import the CSS file
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  IconButton,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DescriptionIcon from "@mui/icons-material/Description";
import { saveAs } from "file-saver";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaExclamationTriangle, FaFileDownload, FaChartBar, FaEye } from 'react-icons/fa';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expirationAlerts, setExpirationAlerts] = useState([]);
  const [reportAnchorEl, setReportAnchorEl] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const EXPIRY_ALERT_DAYS = 30;
  const [expirySummary, setExpirySummary] = useState(null);
  const [showExpiryAlert, setShowExpiryAlert] = useState(false);
  const [reportType, setReportType] = useState('inventory');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [filteredItems, setFilteredItems] = useState([]);

  // Categories for medical lab inventory
  const categories = [
    'Reagents',
    'Lab Equipment',
    'Consumables',
    'Glassware',
    'Safety Equipment',
    'Diagnostic Kits'
  ];

  useEffect(() => {
    fetchItems();
    fetchExpirySummary();
  }, []);

  // Update useEffect to handle all filter changes
  useEffect(() => {
    applyFilters();
  }, [category, reportType, searchQuery, items]);

  const applyFilters = () => {
    try {
      let filtered = [...items];
      
      // Apply category filter
      if (category) {
        filtered = filtered.filter(item => item.category === category);
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(item => 
          item.itemName.toLowerCase().includes(query) || 
          item.itemCode.toLowerCase().includes(query)
        );
      }

      // Apply report type filter
      switch (reportType) {
        case 'low-stock':
          filtered = filtered.filter(item => item.quantity <= item.minStockLevel);
          break;
        case 'expired':
          const now = new Date();
          filtered = filtered.filter(item => 
            item.expirationDate && new Date(item.expirationDate) < now
          );
          break;
        case 'expiring':
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          filtered = filtered.filter(item => 
            item.expirationDate && 
            new Date(item.expirationDate) > new Date() && 
            new Date(item.expirationDate) <= thirtyDaysFromNow
          );
          break;
        case 'inventory':
        default:
          // Show all items
          break;
      }

      setFilteredItems(filtered);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Error filtering inventory items');
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5002/api/inventory");
      const now = new Date();

      const expiryAlerts = res.data.filter((item) => {
        const expiryDate = new Date(item.expirationDate);
        const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 3600 * 24));
        return daysRemaining <= EXPIRY_ALERT_DAYS && daysRemaining >= 0;
      });

      const expiredItems = res.data.filter((item) => new Date(item.expirationDate) < now);

      setItems(res.data);
      setFilteredItems(res.data); // Initialize filtered items
      setLowStockAlerts(res.data.filter((item) => item.quantity < item.minStockLevel));
      setExpirationAlerts([...expiryAlerts, ...expiredItems]);
      setLoading(false);
    } catch (err) {
      setError('Error fetching inventory items');
      setLoading(false);
    }
  };

  const fetchExpirySummary = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/inventory/status/expiry-summary');
      setExpirySummary(response.data);
      setShowExpiryAlert(response.data.expired > 0 || response.data.expiringThirtyDays > 0);
    } catch (err) {
      console.error('Error fetching expiry summary:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
    try {
      await axios.delete(`http://localhost:5002/api/inventory/${id}`);
        fetchItems(); // Refresh the list
    } catch (err) {
        setError('Error deleting item');
      }
    }
  };

  // Update handleSearch to use local filtering instead of API call
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Update handleCategoryChange
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // Update handleReportTypeChange
  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const totalAlerts = lowStockAlerts.length + expirationAlerts.length;

  const generateReport = async (type, format) => {
    try {
      setLoadingReport(true);
      const response = await axios.post(
        "http://localhost:5002/api/reports",
        { reportType: type, format },
        { responseType: "blob" }
      );
      const filename = `${type}_report_${new Date().toISOString().split("T")[0]}.${format}`;
      saveAs(new Blob([response.data]), filename);
    } catch (error) {
      console.error("Error generating report:", error);
      alert(error.response?.data?.error || error.message);
    } finally {
      setLoadingReport(false);
      setReportAnchorEl(null);
    }
  };

  const renderStockStatus = (quantity, minStockLevel) => {
    const isLowStock = quantity < minStockLevel;

    if (isLowStock) {
      return <Alert severity="warning" sx={{ p: 0 }}>Low Stock: {quantity} (Minimum: {minStockLevel})</Alert>;
    } else {
      return quantity;
    }
  };

  const renderExpiryStatus = (expiryDate) => {
    const isExpired = expiryDate < new Date();
    const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 3600 * 24));
    const isNearExpiry = daysRemaining <= EXPIRY_ALERT_DAYS;

    if (isExpired) {
      return <Alert severity="error" sx={{ p: 0 }}>EXPIRED: {expiryDate.toLocaleDateString()}</Alert>;
    } else if (isNearExpiry) {
      return <Alert severity="warning" sx={{ p: 0 }}>Expires in {daysRemaining} days</Alert>;
    } else {
      return expiryDate.toLocaleDateString();
    }
  };

  const getExpiryStatus = (expirationDate) => {
    if (!expirationDate) return null;
    
    const today = new Date();
    const expiry = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'Expired', class: 'bg-red-100 text-red-800' };
    } else if (daysUntilExpiry <= 30) {
      return { status: `Expires in ${daysUntilExpiry} days`, class: 'bg-yellow-100 text-yellow-800' };
    } else if (daysUntilExpiry <= 90) {
      return { status: `Expires in ${daysUntilExpiry} days`, class: 'bg-blue-100 text-blue-800' };
    }
    return { status: 'Valid', class: 'bg-green-100 text-green-800' };
  };

  // Add new function for downloading reports
  const downloadReport = async () => {
    setLoadingReport(true);
    try {
      console.log('Downloading report:', { type: reportType, format: reportFormat });
      const response = await axios.get(
        `http://localhost:5002/api/inventory/reports/${reportType}?format=${reportFormat}`,
        { responseType: 'blob' }
      );
      
      // Create a blob URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report.${reportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError(err.response?.data?.message || 'Error downloading report');
    } finally {
      setLoadingReport(false);
    }
  };

  // Add inventory analysis calculations
  const getInventoryAnalysis = () => {
    const totalItems = items.length;
    const lowStockItems = items.filter(item => item.quantity < item.minStockLevel).length;
    const expiredItems = items.filter(item => {
      if (!item.expirationDate) return false;
      return new Date(item.expirationDate) < new Date();
    }).length;
    const expiringSoonItems = items.filter(item => {
      if (!item.expirationDate) return false;
                  const expiryDate = new Date(item.expirationDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;

    return {
      totalItems,
      lowStockItems,
      expiredItems,
      expiringSoonItems
    };
  };

  const analysis = getInventoryAnalysis();

  // Add reset filters function
  const resetFilters = () => {
    setSearchQuery('');
    setCategory('');
    setReportType('inventory');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

                  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          {/* {showExpiryAlert && expirySummary && (
            <div className="flex items-center gap-4">
              {expirySummary.expired > 0 && (
                <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                  <FaExclamationTriangle />
                  <span>{expirySummary.expired} expired items</span>
                </div>
              )}
              {expirySummary.expiringThirtyDays > 0 && (
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                  <FaExclamationTriangle />
                  <span>{expirySummary.expiringThirtyDays} items expiring soon</span>
                </div>
              )}
            </div>
          )} */}
        </div>
        
        {/* Inventory Analysis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Total Items</h3>
              <FaChartBar className="text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{analysis.totalItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Low Stock Items</h3>
              <FaExclamationTriangle className="text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{analysis.lowStockItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Expired Items</h3>
              <FaExclamationTriangle className="text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{analysis.expiredItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Expiring Soon</h3>
              <FaExclamationTriangle className="text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{analysis.expiringSoonItems}</p>
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Generate Reports</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={reportType}
              onChange={handleReportTypeChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="inventory">Inventory Summary</option>
              <option value="low-stock">Low Stock Items</option>
              <option value="expired">Expired Items</option>
              <option value="expiring">Expiring Soon</option>
            </select>
            <select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
            <button
              onClick={downloadReport}
              disabled={loadingReport}
              className={`flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors
                ${loadingReport ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaFileDownload />
              {loadingReport ? 'Generating...' : 'Download Report'}
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
          value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <FaSearch className="rotate-90" /> Reset Filters
          </button>
          <Link
            to="/add-item"
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaPlus /> Add New Item
          </Link>
      </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Inventory Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => {
                const expiryStatus = getExpiryStatus(item.expirationDate);
              return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.quantity > item.minStockLevel ? 'bg-green-100 text-green-800' : 
                          item.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {item.quantity} {item.unit}
                        {item.quantity <= item.minStockLevel && ' (Low Stock)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expiryStatus && (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${expiryStatus.class}`}>
                          {expiryStatus.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <Link to={`/view-item/${item._id}`}
                          className="text-blue-600 hover:text-blue-900">
                          <FaEye className="w-5 h-5" />
                        </Link>
                        <Link to={`/edit-item/${item._id}`}
                          className="text-indigo-600 hover:text-indigo-900">
                          <FaEdit className="w-5 h-5" />
                        </Link>
                        <button onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-900">
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;