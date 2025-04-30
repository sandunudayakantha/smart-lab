import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  itemCode: { 
    type: String, 
    required: true,
    unique: true 
  },
  itemName: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Reagents', 'Lab Equipment', 'Consumables', 'Glassware', 'Safety Equipment', 'Diagnostic Kits']
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 0 
  },
  minStockLevel: { 
    type: Number, 
    required: true,
    min: 0 
  },
  amountUsedPerTest: {
    type: Number,
    min: 0,
    default: 0
  },
  unit: { 
    type: String,
    required: true,
    enum: ['pieces', 'boxes', 'ml', 'l', 'mg', 'g', 'kg', 'units', 'packs', 'bottles', 'tubes', 'vials', 'bags', 'rolls', 'sheets', 'meters', 'cm', 'mm'],
    default: 'pieces'
  },
  location: { 
    type: String
  },
  supplier: { 
    type: String
  },
  notes: { 
    type: String
  },
  expirationDate: { 
    type: Date
  },
  lastUpdated: { 
    type: Date,
    default: Date.now 
  },
  usageHistory: [{
    date: { type: Date, default: Date.now },
    quantityUsed: Number,
    usedBy: String,
    purpose: String
  }]
}, {
  timestamps: true
});

// Add index for better search performance
inventorySchema.index({ itemName: 'text', itemCode: 'text' });

export default mongoose.model("Inventory", inventorySchema);