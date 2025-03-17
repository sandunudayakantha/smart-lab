import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // For navigation


function TestTemplates() {
  const [templates, setTemplates] = useState([]);

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

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Test Templates</h1>
      <div className="space-y-4">
        {templates.length > 0 ? (
          templates.map((template) => (
            <div key={template._id} className="p-4 border rounded bg-white">
              <h2 className="text-xl font-semibold">{template.templateName}</h2>
              <p className="text-gray-600">{template.description}</p>
              <Link
                to={`/testTemplates/${template._id}`} // Link to template details
                className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                View Details
              </Link>
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