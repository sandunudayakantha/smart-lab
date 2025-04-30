import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';

const AddItem = () => {
  const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
        itemCode: '',
        itemName: '',
        category: '',
        quantity: '',
        minStockLevel: '',
        amountUsedPerTest: '',
        unit: '',
        location: '',
        supplier: '',
        notes: '',
        expirationDate: ''
    });

    const [errors, setErrors] = useState({});

    const categories = [
        'Reagents',
        'Lab Equipment',
        'Consumables',
        'Glassware',
        'Safety Equipment',
        'Diagnostic Kits'
    ];

    const units = [
        'pieces',
        'boxes',
        'ml',
        'l',
        'mg',
        'g',
        'kg',
        'units',
        'packs',
        'bottles',
        'tubes',
        'vials',
        'bags',
        'rolls',
        'sheets',
        'meters',
        'cm',
        'mm'
    ];

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.itemCode.trim()) {
            newErrors.itemCode = 'Item Code is required';
        } else if (formData.itemCode.length < 3) {
            newErrors.itemCode = 'Item Code must be at least 3 characters';
        }

        if (!formData.itemName.trim()) {
            newErrors.itemName = 'Item Name is required';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (!formData.unit.trim()) {
            newErrors.unit = 'Unit is required';
        }

        if (!formData.expirationDate) {
            newErrors.expirationDate = 'Expiration Date is required';
        }

        // Numeric fields validation
        if (formData.quantity === '') {
            newErrors.quantity = 'Quantity is required';
        } else if (isNaN(formData.quantity) || Number(formData.quantity) < 0) {
            newErrors.quantity = 'Quantity must be a non-negative number';
        }

        if (formData.minStockLevel === '') {
            newErrors.minStockLevel = 'Minimum Stock Level is required';
        } else if (isNaN(formData.minStockLevel) || Number(formData.minStockLevel) < 0) {
            newErrors.minStockLevel = 'Minimum Stock Level must be a non-negative number';
        }

        if (formData.amountUsedPerTest === '') {
            newErrors.amountUsedPerTest = 'Amount Used Per Test is required';
        } else if (isNaN(formData.amountUsedPerTest) || Number(formData.amountUsedPerTest) < 0) {
            newErrors.amountUsedPerTest = 'Amount Used Per Test must be a non-negative number';
        }

        // Date validation
        if (formData.expirationDate) {
            const expiryDate = new Date(formData.expirationDate);
            const today = new Date();
            if (expiryDate < today) {
                newErrors.expirationDate = 'Expiration date cannot be in the past';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            // Convert quantity and minStockLevel to numbers
            const dataToSend = {
                ...formData,
                quantity: Number(formData.quantity),
                minStockLevel: Number(formData.minStockLevel),
                amountUsedPerTest: formData.amountUsedPerTest ? Number(formData.amountUsedPerTest) : 0
            };

            // Format expiration date if provided
            if (formData.expirationDate) {
                dataToSend.expirationDate = new Date(formData.expirationDate).toISOString();
            }

            console.log('Sending data to server:', dataToSend);
            const response = await axios.post('http://localhost:5002/api/inventory', dataToSend);
            console.log('Server response:', response.data);
            navigate('/dashboard');
        } catch (err) {
            console.error('Error adding item:', err);
            if (err.response?.data?.errors) {
                setError(err.response.data.errors.join(', '));
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred while adding the item');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <FaArrowLeft /> Back
                </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Item</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-bold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Code
                            </label>
                            <input
                                type="text"
                                name="itemCode"
                                required
                                value={formData.itemCode}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Name
                            </label>
                            <input
                                type="text"
                                name="itemName"
                                required
                                value={formData.itemName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                required
                                min="0"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Stock Level
                            </label>
                            <input
                                type="number"
                                name="minStockLevel"
                                required
                                min="0"
                                value={formData.minStockLevel}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount Used Per Test
                            </label>
                            <input
                                type="number"
                                name="amountUsedPerTest"
                                required
                                min="0"
                                step="0.01"
                                value={formData.amountUsedPerTest}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                    errors.amountUsedPerTest ? 'border-red-500' : ''
                                }`}
                                placeholder="Enter amount used per test"
                            />
                            {errors.amountUsedPerTest && (
                                <p className="mt-1 text-sm text-red-600">{errors.amountUsedPerTest}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Unit
                            </label>
                            <select
                                name="unit"
                                required
                                value={formData.unit}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                    errors.unit ? 'border-red-500' : ''
                                }`}
                            >
                                <option value="">Select Unit</option>
                                {units.map(unit => (
                                    <option key={unit} value={unit}>
                                        {unit}
                                    </option>
                                ))}
                            </select>
                            {errors.unit && (
                                <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Storage Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Supplier
                            </label>
                            <input
                                type="text"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiration Date
                            </label>
                            <input
                                type="date"
                                name="expirationDate"
                                required
                                value={formData.expirationDate}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                                    errors.expirationDate ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.expirationDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.expirationDate}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors
                                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Adding...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItem;