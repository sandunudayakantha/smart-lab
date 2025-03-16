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

//search template

export const searchTemplates = async (req, res) => {
    try {
        const { templateName, shortName } = req.query; // Get query parameters

        // Build the query object dynamically
        const query = {};
        if (templateName) {
            query.templateName = { $regex: templateName, $options: 'i' }; // Case-insensitive search for templateName
        }
        if (shortName) {
            query.shortName = { $regex: shortName, $options: 'i' }; // Case-insensitive search for shortName
        }

        // If no search parameters are provided, return all templates
        if (Object.keys(query).length === 0) {
            const allTemplates = await TestTemplate.find();
            return res.status(200).json({ templates: allTemplates });
        }

        // Query the database for matching templates
        const templates = await TestTemplate.find(query);

        // If no templates are found, return a 404 response
        if (templates.length === 0) {
            return res.status(404).json({ message: "No templates found matching the search criteria" });
        }

        // Return the matching templates
        res.status(200).json({ templates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching test templates", error });
    }
};

//ffdfdfdfdfdfdfdfbgjjj


//jhhjhjjj
//yyyy
//hugjhfsdfghj