import express from 'express';
import {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    searchUsers
} from '../controllers/user.controller.js';

const router = express.Router();

// Search users (must come before the :id route)
router.get('/search', searchUsers);

// Get all users
router.get('/', getAllUsers);

// User routes
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router; 