import express from "express";
import {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  searchItems,
  getLowStockItems,
  addUsageRecord,
  getExpiringItems,
  getExpiredItems,
  getExpirySummary
} from "../controllers/inventoryController.js";
import { generateInventoryReport } from '../controllers/reportController.js';

const router = express.Router();

// Search and status routes (specific routes first)
router.get("/search/items", searchItems);
router.get("/status/low-stock", getLowStockItems);
router.get("/status/expiring", getExpiringItems);
router.get("/status/expired", getExpiredItems);
router.get("/status/expiry-summary", getExpirySummary);

// Base CRUD routes
router.get("/", getAllItems);
router.post("/", addItem);

// Usage route
router.post("/:id/usage", addUsageRecord);

// Parameterized routes last
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

// Report generation route
router.get('/reports/:type', (req, res) => {
  const { type } = req.params;
  const { format = 'pdf' } = req.query;
  generateInventoryReport(req, res, type, format);
});

export default router;