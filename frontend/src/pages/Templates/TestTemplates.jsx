import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function TestTemplates() {
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate();

  // Fetch all templates from the backend
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get("http://localhost:5002/api/testTemplates");
        setTemplates(response.data);
      } catch (error) {
        console.error("Error fetching templates:", error.response?.data || error.message);
      }
    };

    fetchTemplates();
  }, []);

  const handleCreateTemplateClick = () => {
    navigate("/templates"); // Navigate to the `/templates` route
  };

  const handleUpdateTemplateClick = () => {
    navigate("/templates"); // Navigate to the `/templates` route
  };

  // Handle Delete Template
  const handleDeleteTemplate = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this template?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5002/api/testTemplates/${id}`);
        // Remove the deleted template from the state
        setTemplates((prevTemplates) =>
          prevTemplates.filter((template) => template._id !== id)
        );
        alert("Template deleted successfully!");
      } catch (error) {
        console.error("Error deleting template:", error.response?.data || error.message);
        alert("Failed to delete template. Please try again.");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Test Templates</h1>

      <button
        onClick={handleCreateTemplateClick}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mx-4 mb-5"
      >
        Create Template
      </button>

      <div className="space-y-4">
        {templates.length > 0 ? (
          templates.map((template) => (
            <div key={template._id} className="p-4 border rounded bg-white">
              <h2 className="text-xl font-semibold">{template.templateName}</h2>
              <p className="text-gray-600">{template.description}</p>

              {/* Create Report Button */}
              <Link
                to={`/create-report/${template._id}`} // Use template._id to navigate
                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-5"
              >
                Create Report
              </Link>

              {/* Update Template Button */}
              <Link
                to={`/update-template/${template._id}`} // Link to update template
                className="mt-2 inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 ml-5"
              >
                Update
              </Link>

              {/* Delete Template Button */}
              <button
                onClick={() => handleDeleteTemplate(template._id)} // Handle delete
                className="mt-2 inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-5"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No templates found.</p>
        )}
      </div>
    </div>
  );
}

export default TestTemplates;