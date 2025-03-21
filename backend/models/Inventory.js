import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  itemCode: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  minStockLevel: { type: Number, required: true },
  expirationDate: { type: Date, required: true },
  usageHistory: {
    date: Date,
    quantityUsed: Number,
    usedBy: String
  }
});

export default mongoose.model("Inventory", inventorySchema);