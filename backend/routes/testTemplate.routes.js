import express from 'express';
import { 
    getAllTestTemplates,
    createTestTemplate, 
    getTestTemplateById, 
    updateTestTemplate, 
    deleteTestTemplate,
    searchTemplates 
} from '../controllers/testTemplate.controller.js';

const router = express.Router();

// Search test templates (must come before the :id route)
router.get('/search', searchTemplates);

// Get all test templates
router.get('/', getAllTestTemplates);

// Create a new test template
router.post('/', createTestTemplate);

// Get a single test template by ID
router.get('/:id', getTestTemplateById);

// Update a test template
router.put('/:id', updateTestTemplate);

// Delete a test template
router.delete('/:id', deleteTestTemplate);

export default router; 