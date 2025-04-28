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

  const [errors, setErrors] = useState({
    itemName: "",
    itemCode: "",
    category: "",
    quantity: "",
    minStockLevel: "",
    expirationDate: "",
  });

  // Validation function
  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate Item Name
    if (!formData.itemName.trim()) {
      newErrors.itemName = "Item Name is required";
      isValid = false;
    } else {
      newErrors.itemName = "";
    }

    // Validate Item Code
    if (!formData.itemCode.trim()) {
      newErrors.itemCode = "Item Code is required";
      isValid = false;
    } else {
      newErrors.itemCode = "";
    }

    // Validate Category
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
      isValid = false;
    } else {
      newErrors.category = "";
    }

    // Validate Quantity
    if (!formData.quantity) {
      newErrors.quantity = "Quantity is required";
      isValid = false;
    } else if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
      isValid = false;
    } else {
      newErrors.quantity = "";
    }

    // Validate Minimum Stock Level
    if (!formData.minStockLevel) {
      newErrors.minStockLevel = "Minimum Stock Level is required";
      isValid = false;
    } else if (formData.minStockLevel < 0) {
      newErrors.minStockLevel = "Minimum Stock Level cannot be negative";
      isValid = false;
    } else {
      newErrors.minStockLevel = "";
    }

    // Validate Expiration Date
    if (!formData.expirationDate) {
      newErrors.expirationDate = "Expiration Date is required";
      isValid = false;
    } else {
      newErrors.expirationDate = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form before submitting
    if (!validateForm()) {
      return;
    }

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
          error={!!errors.itemName}
          helperText={errors.itemName}
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
          error={!!errors.itemCode}
          helperText={errors.itemCode}
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
          error={!!errors.category}
          helperText={errors.category}
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
          error={!!errors.quantity}
          helperText={errors.quantity}
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
          error={!!errors.minStockLevel}
          helperText={errors.minStockLevel}
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
          error={!!errors.expirationDate}
          helperText={errors.expirationDate}
        />

        {/* Buttons */}
        <div className="add-item-buttons">
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
          <Button component={Link} to="/dashboard" variant="outlined" color="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;