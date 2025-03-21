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

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expirationAlerts, setExpirationAlerts] = useState([]);
  const [reportAnchorEl, setReportAnchorEl] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const EXPIRY_ALERT_DAYS = 30;

  useEffect(() => {
    fetchItems();
  }, []);

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
      setLowStockAlerts(res.data.filter((item) => item.quantity < item.minStockLevel));
      setExpirationAlerts([...expiryAlerts, ...expiredItems]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5002/api/inventory/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div>
      <h1>Inventory Dashboard</h1>

      <IconButton
        color="inherit"
        onClick={() => setNotificationPanelOpen(true)}
        style={{ position: "absolute", right: "20px", top: "20px" }}
      >
        <Badge badgeContent={totalAlerts} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Dialog open={notificationPanelOpen} onClose={() => setNotificationPanelOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>System Alerts</DialogTitle>
        <DialogContent>
          {lowStockAlerts.length > 0 && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>Low Stock Items</AlertTitle>
              </Alert>
              <List dense sx={{ mb: 3 }}>
                {lowStockAlerts.map((item) => (
                  <ListItem key={`low-stock-${item._id}`}>
                    <ListItemText
                      primary={item.itemName}
                      secondary={`Current: ${item.quantity} (Minimum: ${item.minStockLevel})`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {expirationAlerts.length > 0 && (
            <>
              <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle>Expiration Warnings</AlertTitle>
              </Alert>
              <List dense>
                {expirationAlerts.map((item) => {
                  const expiryDate = new Date(item.expirationDate);
                  const isExpired = expiryDate < new Date();
                  const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 3600 * 24));

                  return (
                    <ListItem key={`expiry-${item._id}`}>
                      <ListItemText
                        primary={item.itemName}
                        secondary={
                          isExpired
                            ? `EXPIRED on ${expiryDate.toLocaleDateString()}`
                            : `Expires in ${daysRemaining} days (${expiryDate.toLocaleDateString()})`
                        }
                      />
                      {isExpired && <Alert severity="error" sx={{ ml: 2 }}>Expired!</Alert>}
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}

          {totalAlerts === 0 && (
            <Alert severity="info">
              <AlertTitle>No Active Alerts</AlertTitle>
              All items are within safe stock levels and expiration dates.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationPanelOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <div style={{ marginBottom: "20px" }}>
        <TextField
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          style={{ marginRight: "10px" }}
        />
        <TextField
          select
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          variant="outlined"
          size="small"
          style={{ marginRight: "10px", minWidth: "150px" }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="reagents">Reagents</MenuItem>
          <MenuItem value="chemicals">Chemicals</MenuItem>
          <MenuItem value="equipment">Equipment</MenuItem>
          <MenuItem value="test_kits">Test Kits</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>
        <Button component={Link} to="/AddItem" variant="contained" color="primary" style={{ marginRight: "10px" }}>
          Add Item
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<DescriptionIcon />}
          onClick={(e) => setReportAnchorEl(e.currentTarget)}
          disabled={loadingReport}
          style={{ marginRight: "10px" }}
        >
          {loadingReport ? "Generating..." : "Generate Report"}
        </Button>
      </div>

      <Menu anchorEl={reportAnchorEl} open={Boolean(reportAnchorEl)} onClose={() => setReportAnchorEl(null)}>
        <MenuItem onClick={() => generateReport("inventory", "pdf")}>Inventory Levels (PDF)</MenuItem>
        <MenuItem onClick={() => generateReport("inventory", "xlsx")}>Inventory Levels (Excel)</MenuItem>
        <MenuItem onClick={() => generateReport("expiry", "pdf")}>Expiry Dates (PDF)</MenuItem>
        <MenuItem onClick={() => generateReport("expiry", "xlsx")}>Expiry Dates (Excel)</MenuItem>
        <MenuItem onClick={() => generateReport("usage", "pdf")}>Usage Patterns (PDF)</MenuItem>
        <MenuItem onClick={() => generateReport("usage", "xlsx")}>Usage Patterns (Excel)</MenuItem>
      </Menu>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Expiry Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => {
              const expiryDate = new Date(item.expirationDate);
              const isExpired = expiryDate < new Date();
              const isNearExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 3600 * 24)) <= EXPIRY_ALERT_DAYS;

              return (
                <TableRow
                  key={item._id}
                  sx={{
                    backgroundColor: isExpired ? "#ffe6e6" : isNearExpiry ? "#fff3e6" : "inherit",
                    "&:hover": {
                      backgroundColor: isExpired ? "#ffcccc" : isNearExpiry ? "#ffe6cc" : "#f5f5f5",
                    },
                  }}
                >
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>
                    {renderStockStatus(item.quantity, item.minStockLevel)}
                  </TableCell>
                  <TableCell>{renderExpiryStatus(expiryDate)}</TableCell>
                  <TableCell>
                    <Button component={Link} to={`/edit/${item._id}`} variant="outlined" color="primary" size="small" style={{ marginRight: "10px" }}>
                      Edit
                    </Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => openDeleteDialog(item._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this item?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDelete(itemToDelete)} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;