import userModel from '../models/userModel.js';

// Create a new user
export const createUser = async (req, res) => {
    try {
        // Ensure age object is properly structured
        const userData = {
            ...req.body,
            age: {
                years: req.body.age?.years || 0,
                months: req.body.age?.months || 0
            }
        };
        
        const newUser = new userModel(userData);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a user
export const updateUser = async (req, res) => {
    try {
        const updatedUser = await userModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a user
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await userModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search users by name or ID
export const searchUsers = async (req, res) => {
    try {
        const { name, id } = req.query;
        console.log('Search request received with query:', req.query);

        // Build the search query
        let query = {};

        // If both name and id are provided, search for either
        if (name && id) {
            query = {
                $or: [
                    { name: { $regex: name, $options: "i" } },
                    { _id: id }
                ]
            };
        } else if (name) {
            // If only name is provided
            query = { name: { $regex: name, $options: "i" } };
        } else if (id) {
            // If only id is provided
            query = { _id: id };
        }

        console.log('Constructed MongoDB query:', JSON.stringify(query));

        // Find matching users
        const users = await userModel.find(query).select('name email phone age');
        console.log('Found users:', users);

        // Return the results
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error in searchUsers:", error);
        return res.status(500).json({ 
            message: "Error searching users", 
            error: error.message,
            stack: error.stack
        });
    }
}; 