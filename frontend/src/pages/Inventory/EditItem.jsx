import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { TextField, Button, MenuItem } from "@mui/material";
import "./EditItem.css";

const EditItem = () => {
  const { itemID } = useParams(); // Get the itemID from the URL
  const navigate = useNavigate(); // For programmatic navigation
  const [formData, setFormData] = useState({
    itemName: "",
    itemCode: "",
    category: "",
    quantity: "",
    minStockLevel: "",
    expirationDate: "",
  });

  // Fetch the item data based on itemID
  useEffect(() => {
    const fetchItem = async () => {
      try {
        console.log("Fetching item with ID:", itemID);
        const res = await axios.get(`http://localhost:5002/api/inventory/${itemID}`);
        console.log("Fetched item data:", res.data);
        setFormData(res.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          alert("Item not found. Redirecting to dashboard...");
          navigate("/");
        } else {
          console.error("Error fetching item data:", err);
        }
      }
    };

    fetchItem();
  }, [itemID, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5002/api/inventory/${itemID}`, formData);
      alert("Item updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  return (
    <div className="edit-item-container">
      <h1>Edit Item</h1>
      <form onSubmit={handleSubmit} className="edit-item-form">
        {/* Item Name */}
        <TextField
          label="Item Name"
          name="itemName"
          value={formData.itemName}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />

        {/* Item Code */}
        <TextField
          label="Item Code"
          name="itemCode"
          value={formData.itemCode}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />

        {/* Category Dropdown */}
        <TextField
          select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        >
          <MenuItem value="reagents">Reagents</MenuItem>
          <MenuItem value="chemicals">Chemicals</MenuItem>
          <MenuItem value="equipment">Equipment</MenuItem>
          <MenuItem value="test_kits">Test Kits</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>

        {/* Quantity */}
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />

        {/* Minimum Stock Level */}
        <TextField
          label="Minimum Stock Level"
          name="minStockLevel"
          type="number"
          value={formData.minStockLevel}
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />

        {/* Expiration Date */}
        <TextField
          label="Expiration Date"
          name="expirationDate"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.expirationDate.split("T")[0]} // Format date for input
          onChange={handleInputChange}
          required
          fullWidth
          margin="normal"
        />

        {/* Buttons */}
        <div className="edit-item-buttons">
          <Button type="submit" variant="contained" color="primary">
            Update Item
          </Button>
          <Button component={Link} to="/dashboard" variant="outlined" color="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditItem;
