import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function UpdateTemplate() {
  const { id } = useParams(); // Get the template ID from the URL
  const navigate = useNavigate(); // Initialize useNavigate
  const [template, setTemplate] = useState({
    templateName: "",
    shortName: "",
    description: "",
    price: 0,
    specimenType: "",
    tests: [],
  });

  // Fetch the template data for editing
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`http://localhost:5002/api/testTemplates/${id}`);
        setTemplate(response.data);
      } catch (error) {
        console.error("Error fetching template:", error.response?.data || error.message);
        alert("Failed to fetch template. Please try again.");
      }
    };

    fetchTemplate();
  }, [id]);

  // Handler for template input changes
  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setTemplate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for adding a new test
  const handleAddTest = () => {
    setTemplate((prev) => ({
      ...prev,
      tests: [
        ...prev.tests,
        {
          testName: "",
          unit: "",
          normalRange: "",
          inputType: "text",
          options: [],
          formula: "",
          variable: "",
          chemicalCode: "",
        },
      ],
    }));
  };

  // Handler for removing a test
  const handleRemoveTest = (index) => {
    setTemplate((prev) => {
      const updatedTests = [...prev.tests];
      updatedTests.splice(index, 1);
      return {
        ...prev,
        tests: updatedTests,
      };
    });
  };

  // Handler for test input changes
  const handleTestChange = (index, e) => {
    const { name, value } = e.target;
    setTemplate((prev) => {
      const updatedTests = [...prev.tests];
      updatedTests[index] = {
        ...updatedTests[index],
        [name]: value,
      };
      return {
        ...prev,
        tests: updatedTests,
      };
    });
  };

  // Handler for adding an option to a select input type
  const handleAddOption = (testIndex) => {
    setTemplate((prev) => {
      const updatedTests = [...prev.tests];
      updatedTests[testIndex].options.push("");
      return {
        ...prev,
        tests: updatedTests,
      };
    });
  };

  // Handler for option input changes
  const handleOptionChange = (testIndex, optionIndex, e) => {
    const { value } = e.target;
    setTemplate((prev) => {
      const updatedTests = [...prev.tests];
      updatedTests[testIndex].options[optionIndex] = value;
      return {
        ...prev,
        tests: updatedTests,
      };
    });
  };

  // Handler for removing an option from a select input type
  const handleRemoveOption = (testIndex, optionIndex) => {
    setTemplate((prev) => {
      const updatedTests = [...prev.tests];
      updatedTests[testIndex].options.splice(optionIndex, 1);
      return {
        ...prev,
        tests: updatedTests,
      };
    });
  };

  // Handler for form submission using Axios
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5002/api/testTemplates/${id}`, // Correct URL
        template // Updated form data
      );

      // Check if the response status is 200 (OK)
      if (response.status === 200) {
        console.log("Template updated successfully:", response.data);
        alert("Template updated successfully!");
        navigate("/alltemplates"); // Navigate to TestTemplates page
      } else {
        // Handle unexpected status codes
        console.error("Unexpected response status:", response.status);
        alert("Failed to update template. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Error response data:", error.response.data);
        console.error("Error status code:", error.response.status);
        alert("Failed to update template. Please check your input and try again.");
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        alert("Network error. Please check your connection and try again.");
      } else {
        // Something happened in setting up the request
        console.error("Error setting up the request:", error.message);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Update Template</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Template Fields */}
        <div className="space-y-2">
          <label className="block font-semibold">Template Name</label>
          <input
            type="text"
            name="templateName"
            value={template.templateName}
            onChange={handleTemplateChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block font-semibold">Short Name</label>
          <input
            type="text"
            name="shortName"
            value={template.shortName}
            onChange={handleTemplateChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block font-semibold">Description</label>
          <input
            type="text"
            name="description"
            value={template.description}
            onChange={handleTemplateChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-semibold">Price</label>
          <input
            type="number"
            name="price"
            value={template.price}
            onChange={handleTemplateChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block font-semibold">Specimen Type</label>
          <input
            type="text"
            name="specimenType"
            value={template.specimenType}
            onChange={handleTemplateChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Dynamic Tests Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Tests</h2>
          {template.tests.map((test, index) => (
            <div key={index} className="p-4 border rounded bg-white">
              <div className="space-y-2">
                <label className="block font-semibold">Test Name</label>
                <input
                  type="text"
                  name="testName"
                  value={test.testName}
                  onChange={(e) => handleTestChange(index, e)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block font-semibold">Unit</label>
                <input
                  type="text"
                  name="unit"
                  value={test.unit}
                  onChange={(e) => handleTestChange(index, e)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-semibold">Normal Range</label>
                <input
                  type="text"
                  name="normalRange"
                  value={test.normalRange}
                  onChange={(e) => handleTestChange(index, e)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-semibold">Input Type</label>
                <select
                  name="inputType"
                  value={test.inputType}
                  onChange={(e) => handleTestChange(index, e)}
                  className="w-full p-2 border rounded"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="select">Select</option>
                </select>
              </div>
              {/* Show options only if inputType is "select" */}
              {test.inputType === "select" && (
                <div className="space-y-2">
                  <label className="block font-semibold">Options</label>
                  {test.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, optionIndex, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter option"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index, optionIndex)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddOption(index)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Option
                  </button>
                </div>
              )}
              {/* Formula and Variable Fields */}
              <div className="space-y-2">
                <label className="block font-semibold">Formula</label>
                <input
                  type="text"
                  name="formula"
                  value={test.formula}
                  onChange={(e) => handleTestChange(index, e)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter formula"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-semibold">Variable</label>
                <input
                  type="text"
                  name="variable"
                  value={test.variable}
                  onChange={(e) => handleTestChange(index, e)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter variable name"
                />
              </div>
              {/* Chemical Code Field */}
              <div className="space-y-2">
                <label className="block font-semibold">Chemical Code</label>
                <input
                  type="text"
                  name="chemicalCode"
                  value={test.chemicalCode}
                  onChange={(e) => handleTestChange(index, e)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter chemical code"
                />
              </div>
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => handleRemoveTest(index)}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddTest}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Add Test
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-6 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Update Template
        </button>
      </form>
    </div>
  );
}

export default UpdateTemplate;