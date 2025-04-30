import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';

const ViewItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`http://localhost:5002/api/inventory/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error("Error fetching item:", err);
        if (err.response?.status === 404) {
          setError('Item not found');
          setTimeout(() => navigate("/dashboard"), 2000);
        } else {
          setError(err.response?.data?.message || 'Error fetching item details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    } else {
      setError('Invalid item ID');
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5002/api/inventory/${id}`);
        navigate("/dashboard");
      } catch (err) {
        setError('Error deleting item');
      }
    }
  };

  const getExpiryStatus = (expirationDate) => {
    if (!expirationDate) return null;
    
    const expiryDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'Expired', class: 'bg-red-100 text-red-800' };
    } else if (daysUntilExpiry <= 30) {
      return { status: `Expiring in ${daysUntilExpiry} days`, class: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: `Expires in ${daysUntilExpiry} days`, class: 'bg-green-100 text-green-800' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!item) return null;

  const expiryStatus = getExpiryStatus(item.expirationDate);

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Item Details</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/edit-item/${id}`)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-900"
            >
              <FaEdit /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-900"
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Item Code</h3>
            <p className="mt-1 text-lg text-gray-900">{item.itemCode}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Item Name</h3>
            <p className="mt-1 text-lg text-gray-900">{item.itemName}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Category</h3>
            <p className="mt-1 text-lg text-gray-900">{item.category}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
            <p className="mt-1 text-lg text-gray-900">
              {item.quantity} {item.unit}
              {item.quantity <= item.minStockLevel && (
                <span className="ml-2 text-yellow-600">(Low Stock)</span>
              )}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Minimum Stock Level</h3>
            <p className="mt-1 text-lg text-gray-900">{item.minStockLevel} {item.unit}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Amount Used Per Test</h3>
            <p className="mt-1 text-lg text-gray-900">{item.amountUsedPerTest || '0'} {item.unit}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Expiration Date</h3>
            <p className="mt-1 text-lg text-gray-900">
              {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'Not set'}
              {expiryStatus && (
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${expiryStatus.class}`}>
                  {expiryStatus.status}
                </span>
              )}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Storage Location</h3>
            <p className="mt-1 text-lg text-gray-900">{item.location || 'Not specified'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
            <p className="mt-1 text-lg text-gray-900">{item.supplier || 'Not specified'}</p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 text-lg text-gray-900 whitespace-pre-wrap">{item.notes || 'No notes'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewItem; 