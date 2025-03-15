import express from "express";

import { createTestReport, deleteTestReport, getAllTestReports, getTestReportById, searchTestReports, updateTestReport} from "../controllers/testReport.controller.js"


const router = express.Router();


router.get("/search", searchTestReports);

router.post("/", createTestReport);

router.get("/", getAllTestReports);

router.get("/:id", getTestReportById);

router.put("/:id", updateTestReport);


router.delete("/:id", deleteTestReport);


export default router