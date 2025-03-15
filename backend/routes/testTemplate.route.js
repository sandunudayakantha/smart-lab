import express from "express";
import { createTestTemplate, deleteTestTemplate, getAllTestTemplates, getTestTemplateById,  searchTemplates,  updateTestTemplate } from "../controllers/testTemplate.controller.js";

const router = express.Router();

router.get("/search", searchTemplates);
router.get("/",getAllTestTemplates);
router.post("/", createTestTemplate);
router.get("/:id", getTestTemplateById);
router.put("/:id", updateTestTemplate);
router.delete("/:id", deleteTestTemplate);


export default router