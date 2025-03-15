import TestReport from "../models/testReport.model.js";
import TestTemplate from "../models/testTemplate.model.js";




// Create a test report
export const createTestReport = async (req, res) => {
    try {
      const newTestReport = new TestReport(req.body);
      await newTestReport.save();
      res.status(201).json(newTestReport);
    } catch (error) {
      res.status(500).json({ message: "Error creating test report", error });
    }
  };





// Get all test reports
export const getAllTestReports = async (req, res) => {
  try {
    // Fetch all test reports and populate only templateId
    const testReports = await TestReport.find().populate("templateId");

    // If no test reports are found
    if (!testReports || testReports.length === 0) {
      return res.status(404).json({ message: "No test reports found" });
    }

    // Return the test reports
    res.status(200).json(testReports);
  } catch (error) {
    console.error("Error fetching test reports:", error); // Log the error for debugging
    res.status(500).json({ message: "Error fetching test reports", error: error.message });
  }
};

// Get a single test report by ID
export const getTestReportById = async (req, res) => {
    try {
      const testReport = await TestReport.findById(req.params.id)
       
        .populate("templateId");
  
      if (!testReport) {
        return res.status(404).json({ message: "Test report not found" });
      }
      res.status(200).json(testReport);
    } catch (error) {
      res.status(500).json({ message: "Error fetching test report", error });
    }
  };

  // Update a test report by ID
export const updateTestReport = async (req, res) => {
    try {
      const updatedTestReport = await TestReport.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      )
        
        .populate("templateId");
  
      if (!updatedTestReport) {
        return res.status(404).json({ message: "Test report not found" });
      }
      res.status(200).json(updatedTestReport);
    } catch (error) {
      res.status(500).json({ message: "Error updating test report", error });
    }
  };


  // Delete a test report by ID
export const deleteTestReport = async (req, res) => {
    try {
      const deletedTestReport = await TestReport.findByIdAndDelete(req.params.id);
      if (!deletedTestReport) {
        return res.status(404).json({ message: "Test report not found" });
      }
      res.status(200).json({ message: "Test report deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting test report", error });
    }
  };


  


// Search test reports by templateName or shortName
export const searchTestReports = async (req, res) => {
  try {
    const { templateName, shortName } = req.query;

    // Step 1: Find matching templates in TestTemplate collection
    const templateQuery = {};
    if (templateName) {
      templateQuery.templateName = { $regex: templateName, $options: "i" }; // Case-insensitive search
    }
    if (shortName) {
      templateQuery.shortName = { $regex: shortName, $options: "i" }; // Case-insensitive search
    }

    const matchingTemplates = await TestTemplate.find(templateQuery);
    const templateIds = matchingTemplates.map((template) => template._id);

    // Step 2: Find test reports that reference the matching templates
    const testReports = await TestReport.find({ templateId: { $in: templateIds } });

    // If no test reports are found
    if (testReports.length === 0) {
      return res.status(404).json({ message: "No matching test reports found" });
    }

    // Return the results
    res.status(200).json(testReports);
  } catch (error) {
    console.error("Error searching test reports:", error); // Log the error for debugging
    res.status(500).json({ message: "Error searching test reports", error: error.message });
  }
};