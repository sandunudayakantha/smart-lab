import Inventory from "../models/Inventory.js";

// Get all items with optional filtering
export const getAllItems = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (lowStock === 'true') {
      query.quantity = { $lte: '$minStockLevel' };
    }

    const items = await Inventory.find(query).sort({ lastUpdated: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single item
export const getItemById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new item
export const addItem = async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    // Validate required fields
    const requiredFields = ['itemCode', 'itemName', 'category', 'quantity', 'minStockLevel'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate category
    const validCategories = ['Reagents', 'Lab Equipment', 'Consumables', 'Glassware', 'Safety Equipment', 'Diagnostic Kits'];
    if (!validCategories.includes(req.body.category)) {
      return res.status(400).json({ 
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      });
    }

    // Validate numeric fields
    if (isNaN(req.body.quantity) || isNaN(req.body.minStockLevel)) {
      return res.status(400).json({ 
        message: 'Quantity and minimum stock level must be numbers' 
      });
    }

    if (req.body.quantity < 0 || req.body.minStockLevel < 0) {
      return res.status(400).json({ 
        message: 'Quantity and minimum stock level cannot be negative' 
      });
    }

    // Check for duplicate item code
    const existingItem = await Inventory.findOne({ itemCode: req.body.itemCode });
    if (existingItem) {
      return res.status(400).json({ message: "Item code already exists" });
    }

    // Format the data
    const itemData = {
      ...req.body,
      quantity: Number(req.body.quantity),
      minStockLevel: Number(req.body.minStockLevel),
      lastUpdated: new Date()
    };

    // Handle expiration date if provided
    if (req.body.expirationDate) {
      itemData.expirationDate = new Date(req.body.expirationDate);
    }

    console.log('Creating item with data:', itemData);
    const item = new Inventory(itemData);
    const savedItem = await item.save();
    console.log('Item saved successfully:', savedItem);
    
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error in addItem controller:', err);
    // Check for specific Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    // Check for duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Item code already exists' });
    }
    // Check for MongoDB connection error
    if (err.name === 'MongoServerError') {
      return res.status(500).json({ 
        message: 'Database connection error',
        error: err.message
      });
    }
    // General error
    res.status(500).json({ 
      message: 'Error adding item',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If updating itemCode, check for duplicates
    if (updates.itemCode) {
      const existingItem = await Inventory.findOne({ 
        itemCode: updates.itemCode,
        _id: { $ne: id } // Exclude current item from the check
      });
      if (existingItem) {
        return res.status(400).json({ 
          message: "Item code already exists",
          details: `The item code '${updates.itemCode}' is already in use by another item`
        });
      }
    }

    // Format numeric fields
    if (updates.quantity) {
      updates.quantity = Number(updates.quantity);
    }
    if (updates.minStockLevel) {
      updates.minStockLevel = Number(updates.minStockLevel);
    }

    // Update lastUpdated timestamp
    updates.lastUpdated = new Date();

    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error('Error in updateItem controller:', err);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Item code already exists',
        details: 'The item code you are trying to use is already in use by another item'
      });
    }

    res.status(500).json({ 
      message: 'Error updating item',
      error: err.message
    });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search items
export const searchItems = async (req, res) => {
  try {
    const { query, category } = req.query;
    let searchQuery = {};

    if (query) {
      searchQuery.$or = [
        { itemName: { $regex: query, $options: "i" } },
        { itemCode: { $regex: query, $options: "i" } }
      ];
    }

    if (category) {
      searchQuery.category = category;
    }

    const items = await Inventory.find(searchQuery).sort({ lastUpdated: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({
      $expr: {
        $lte: ["$quantity", "$minStockLevel"]
      }
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add usage record
export const addUsageRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityUsed, usedBy, purpose } = req.body;

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.quantity < quantityUsed) {
      return res.status(400).json({ message: "Insufficient quantity available" });
    }

    // Add usage record and update quantity
    item.usageHistory.push({
      date: new Date(),
      quantityUsed,
      usedBy,
      purpose
    });
    item.quantity -= quantityUsed;
    item.lastUpdated = new Date();

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get expiring items
export const getExpiringItems = async (req, res) => {
  try {
    const { days = 30 } = req.query; // Default to 30 days
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const items = await Inventory.find({
      expirationDate: {
        $exists: true,
        $ne: null,
        $gte: today,
        $lte: futureDate
      }
    }).sort({ expirationDate: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get expired items
export const getExpiredItems = async (req, res) => {
  try {
    const today = new Date();

    const items = await Inventory.find({
      expirationDate: {
        $exists: true,
        $ne: null,
        $lt: today
      }
    }).sort({ expirationDate: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get expiry summary
export const getExpirySummary = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    const [expired, expiringThirtyDays, expiringNinetyDays] = await Promise.all([
      // Get expired items count
      Inventory.countDocuments({
        expirationDate: { $lt: today }
      }),
      // Get items expiring in 30 days count
      Inventory.countDocuments({
        expirationDate: {
          $gte: today,
          $lte: thirtyDaysFromNow
        }
      }),
      // Get items expiring in 90 days count
      Inventory.countDocuments({
        expirationDate: {
          $gte: today,
          $lte: ninetyDaysFromNow
        }
      })
    ]);

    res.json({
      expired,
      expiringThirtyDays,
      expiringNinetyDays
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};