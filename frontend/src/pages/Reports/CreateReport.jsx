import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { evaluate } from "mathjs"; // Import math.js

const CreateReport = () => {
  const { id } = useParams(); // Get the template ID from the URL
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [comment, setComment] = useState(""); // State for comment
  const [completeStatus, setCompleteStatus] = useState(false); // State for completeStatus
  const [repeatStatus, setRepeatStatus] = useState(false); // State for repeatStatus
  const [outSideStatus, setOutSideStatus] = useState(false); // State for outSideStatus
  const [error, setError] = useState("");
  const [variables, setVariables] = useState({}); // Store variables for formulas

  // Fetch the Test Template by ID
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`http://localhost:5002/api/testTemplates/${id}`);
        setTemplate(response.data);
        initializeTestResults(response.data.tests);
      } catch (err) {
        setError("Failed to fetch test template");
        console.error(err);
      }
    };

    fetchTemplate();
  }, [id]);

  // Initialize test results state based on the template
  const initializeTestResults = (tests) => {
    const initialResults = tests.map((test) => ({
      testName: test.testName,
      result: "",
      unit: test.unit,
      normalRange: test.normalRange,
      inputType: test.inputType,
      options: test.options,
      formula: test.formula,
      variable: test.variable,
    }));
    setTestResults(initialResults);
  };

  // Handle input change for test results
  const handleInputChange = (index, value) => {
    const updatedResults = [...testResults];
    updatedResults[index].result = value;

    // Parse the input value as a number
    const parsedValue = parseFloat(value) || 0;

    // Update variables if the test has a variable
    if (updatedResults[index].variable) {
      setVariables((prev) => ({
        ...prev,
        [updatedResults[index].variable]: parsedValue,
      }));
    }

    setTestResults(updatedResults);
  };

  // Evaluate formulas whenever variables change
  useEffect(() => {
    evaluateFormulas();
  }, [variables]);

  // Evaluate formulas and update results
  const evaluateFormulas = () => {
    const updatedResults = testResults.map((test) => {
      if (test.formula) {
        try {
          // Use math.js to evaluate the formula
          const result = evaluate(test.formula, variables);
          return { ...test, result: result.toString() };
        } catch (err) {
          console.error("Error evaluating formula:", err);
          return test; // Return the test without updating the result
        }
      }
      return test;
    });

    setTestResults(updatedResults);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const testReportData = {
        patientId: "64f8e8f1e4b0d1a2b3c4d5e6", // Replace with actual patient ID
        invoiceId: "64f8e8f1e4b0d1a2b3c4d5e7", // Replace with actual invoice ID
        templateId: id,
        comment, // Include comment
        completeStatus: true, // Automatically set to true
        repeatStatus, // Include repeatStatus
        outSideStatus, // Include outSideStatus
        testResults, // Include test results
      };

      const response = await axios.post("http://localhost:5002/api/testReports", testReportData);
      alert("Test report saved successfully!");
      navigate(`/testReports/${response.data._id}`); // Navigate to the preview page
    } catch (err) {
      setError("Failed to save test report");
      console.error(err);
    }
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Create Test Report</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold">Template: {template.templateName}</h2>

        {/* Comment Field */}
        <div className="space-y-2">
          <label className="block font-semibold">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter additional notes"
          />
        </div>

        {/* Checkboxes for Boolean Fields */}
        <div className="space-y-2">
          <label className="block font-semibold">Status</label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={completeStatus}
                onChange={(e) => setCompleteStatus(e.target.checked)}
                className="mr-2"
                disabled // Disable the checkbox since it's automatically set to true
              />
              Complete Status
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={repeatStatus}
                onChange={(e) => setRepeatStatus(e.target.checked)}
                className="mr-2"
              />
              Repeat Status
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={outSideStatus}
                onChange={(e) => setOutSideStatus(e.target.checked)}
                className="mr-2"
              />
              Outside Status
            </label>
          </div>
        </div>

        {/* Test Results Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Test Results</h2>
          {testResults.map((test, index) => (
            <div key={index} className="p-4 border rounded bg-white">
              <label className="block font-semibold">{test.testName} ({test.unit}): </label>
              {test.inputType === "select" ? (
                <select
                  value={test.result}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  {test.options.map((option, i) => (
                    <option key={i} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={test.inputType}
                  value={test.result}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-full p-2 border rounded"
                />
              )}
              <span className="text-gray-600">Normal Range: {test.normalRange}</span>
              {test.formula && (
                <span className="text-sm text-gray-500">Formula: {test.formula}</span>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Test Report
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default CreateReport;



