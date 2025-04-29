import TestTemplate from "../models/testTemplate.model.js";

//get all templates
export const getAllTestTemplates = async (req, res) => {
    try {
        const templates = await TestTemplate.find();
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ message: "Error fetching test templates", error });
    }
};

//create a template
export const createTestTemplate = async (req, res) => {
    try {
        const newTemplate = new TestTemplate(req.body);
        await newTemplate.save();
        res.status(201).json(newTemplate);
    } catch (error) {
        res.status(500).json({ message: "Error creating test template", error });
    }
};

//get single template

export const getTestTemplateById = async (req, res) => {
    try {
        const template = await TestTemplate.findById(req.params.id);
        if (!template) return res.status(404).json({ message: "Test template not found" });
        res.status(200).json(template);
    } catch (error) {
        res.status(500).json({ message: "Error fetching test template", error });
    }
};

//UPDATE A TEMPLATE
export const updateTestTemplate = async (req, res) => {
    try {
        const updatedTemplate = await TestTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTemplate) return res.status(404).json({ message: "Test template not found" });
        res.status(200).json(updatedTemplate);
    } catch (error) {
        res.status(500).json({ message: "Error updating test template", error });
    }
};

//delete a template

export const deleteTestTemplate = async (req, res) => {
    try {
        const deletedTemplate = await TestTemplate.findByIdAndDelete(req.params.id);
        if (!deletedTemplate) return res.status(404).json({ message: "Test template not found" });
        res.status(200).json({ message: "Test template deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting test template", error });
    }
};

// Search test templates by templateName or shortName
export const searchTemplates = async (req, res) => {
  try {
    const { templateName, shortName } = req.query;
    console.log('Search request received with query:', req.query);
    console.log('Parsed parameters:', { templateName, shortName });

    // Build the search query
    let query = {};

    // If both templateName and shortName are provided, search for either
    if (templateName && shortName) {
      query = {
        $or: [
          { templateName: { $regex: templateName, $options: "i" } },
          { shortName: { $regex: shortName, $options: "i" } }
        ]
      };
    } else if (templateName) {
      // If only templateName is provided
      query = { templateName: { $regex: templateName, $options: "i" } };
    } else if (shortName) {
      // If only shortName is provided
      query = { shortName: { $regex: shortName, $options: "i" } };
    }

    console.log('Constructed MongoDB query:', JSON.stringify(query));

    // Find matching templates
    const templates = await TestTemplate.find(query).select('templateName shortName price');
    console.log('Found templates:', templates);

    // Return the results
    return res.status(200).json(templates);
  } catch (error) {
    console.error("Error in searchTemplates:", error);
    return res.status(500).json({ 
      message: "Error searching test templates", 
      error: error.message,
      stack: error.stack
    });
  }
};

//ffdfdfdfdfdfdfdfbgjjj


//jhhjhjjj
//yyyy
//hugjhfsdfghj

// Search test templates by templateName or shortName
export const searchTestTemplates = async (req, res) => {
  try {
    const { templateName, shortName } = req.query;

    // Build the search query
    const query = {};
    if (templateName) {
      query.templateName = { $regex: templateName, $options: "i" }; // Case-insensitive search
    }
    if (shortName) {
      query.shortName = { $regex: shortName, $options: "i" }; // Case-insensitive search
    }

    // Find matching templates
    const templates = await TestTemplate.find(query);

    // If no templates are found
    if (templates.length === 0) {
      return res.status(404).json({ message: "No matching test templates found" });
    }

    // Return the results
    res.status(200).json(templates);
  } catch (error) {
    console.error("Error searching test templates:", error);
    res.status(500).json({ message: "Error searching test templates", error: error.message });
  }
};