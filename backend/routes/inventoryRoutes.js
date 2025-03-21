import express from "express";
const router = express.Router();
import Inventory from "../models/Inventory.js"; // Import the Inventory model

// Route to fetch all items
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all items");
    const items = await Inventory.find();
    console.log("Fetched items:", items);
    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ message: "Error fetching items" });
  }
});

// Route to fetch a single item by ID
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching item with ID:", req.params.id);
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      console.log("Item not found");
      return res.status(404).json({ message: "Item not found" });
    }
    console.log("Fetched item:", item);
    res.json(item);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ message: "Error fetching item" });
  }
});

// Route to add a new item
router.post("/", async (req, res) => {
  try {
    console.log("Adding new item:", req.body);
    const newItem = new Inventory(req.body);
    const savedItem = await newItem.save();
    console.log("Added item:", savedItem);
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ message: "Error adding item" });
  }
});

// Route to update an item by ID
router.put("/:id", async (req, res) => {
  try {
    console.log("Updating item with ID:", req.params.id);
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated item
    );
    if (!updatedItem) {
      console.log("Item not found");
      return res.status(404).json({ message: "Item not found" });
    }
    console.log("Updated item:", updatedItem);
    res.json(updatedItem);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ message: "Error updating item" });
  }
});

// Route to delete an item by ID
router.delete("/:id", async (req, res) => {
  try {
    console.log("Deleting item with ID:", req.params.id);
    const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      console.log("Item not found");
      return res.status(404).json({ message: "Item not found" });
    }
    console.log("Deleted item:", deletedItem);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Error deleting item" });
  }
});

export default router;