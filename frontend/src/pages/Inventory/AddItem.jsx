import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, MenuItem } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import "./AddItem.css"; // Import the CSS file

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: "",
    itemCode: "",
    category: "",
    quantity: "",
    minStockLevel: "",
    expirationDate: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5002/api/inventory", formData);
      alert("Item added successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error adding item. Please try again.");
    }
  };

  return (
    <div className="add-item-container">
      <h1>Add New Item</h1>
      <form onSubmit={handleSubmit} className="add-item-form">
        {/* Item Name */}
        <TextField
          label="Item Name"
          name="itemName"
          value={formData.itemName}
          onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
          required
          fullWidth
          margin="normal"
        />

        {/* Item Code */}
        <TextField
          label="Item Code"
          name="itemCode"
          value={formData.itemCode}
          onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
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
          value={formData.expirationDate}
          onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
          required
          fullWidth
          margin="normal"
        />

        {/* Buttons */}
        <div className="add-item-buttons">
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
          <Button component={Link} to="/Dashboard" variant="outlined" color="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;
