import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { evaluate } from "mathjs";

const UpdateReport = () => {
  const { id } = useParams(); // Get the report ID from the URL
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null); // State to store the template
  const [testResults, setTestResults] = useState([]); // State to store test results
  const [comment, setComment] = useState(""); // State for the comment field
  const [completeStatus, setCompleteStatus] = useState(false); // State for complete status
  const [repeatStatus, setRepeatStatus] = useState(false); // State for repeat status
  const [outSideStatus, setOutSideStatus] = useState(false); // State for outside status
  const [error, setError] = useState(""); // State for error messages
  const variablesRef = useRef({}); // Ref to store variables for formula evaluation

  // Fetch the report and template data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Fetch the report
        const response = await axios.get(`http://localhost:5002/api/testReports/${id}`);
        const report = response.data;
        console.log("Fetched report:", report);

        // Set the report data
        setComment(report.comment);
        setCompleteStatus(report.completeStatus);
        setRepeatStatus(report.repeatStatus);
        setOutSideStatus(report.outSideStatus);
        setTestResults(report.testResults);

        // Fetch the template
        const templateId = report.templateId?._id || report.templateId;
        if (!templateId) {
          throw new Error("Template ID is missing or invalid");
        }

        const templateResponse = await axios.get(`http://localhost:5002/api/testTemplates/${templateId}`);
        console.log("Fetched template:", templateResponse.data);
        setTemplate(templateResponse.data);

        // Initialize variables for formula evaluation
        initializeVariables(report.testResults);
      } catch (err) {
        setError("Failed to fetch report data");
        console.error("Fetch error:", err);
      }
    };

    fetchReport();
  }, [id]);

  // Initialize variables for formula evaluation
  const initializeVariables = (results) => {
    results.forEach((test) => {
      if (test.variable && test.result !== "") {
        variablesRef.current[test.variable] = parseFloat(test.result);
      }
    });
  };

  // Handle input changes for test results
  const handleInputChange = (index, value) => {
    const updatedResults = [...testResults];
    let parsedValue = parseFloat(value) || 0;

    // Round to two decimal places
    if (!isNaN(parsedValue)) {
      parsedValue = parseFloat(parsedValue.toFixed(2));
    }

    updatedResults[index].result = parsedValue;

    // Update variables for formula evaluation
    if (updatedResults[index].variable) {
      variablesRef.current[updatedResults[index].variable] = parsedValue;
    }

    setTestResults(updatedResults);
    evaluateFormulas(updatedResults); // Re-evaluate formulas
  };

  // Prevent wheel event on number inputs
  const handleWheel = (e) => {
    e.target.blur();
  };

  // Evaluate formulas for dependent fields
  const evaluateFormulas = (results) => {
    const updatedResults = [...results];
    const updatedVariables = { ...variablesRef.current };

    // Build dependency graph for formula evaluation
    const dependencyGraph = buildDependencyGraph(updatedResults);

    dependencyGraph.forEach((testIndex) => {
      const test = updatedResults[testIndex];
      if (test.formula) {
        try {
          // Evaluate the formula
          let result = evaluate(test.formula, updatedVariables);
          result = parseFloat(result.toFixed(2)); // Round to two decimal places
          updatedResults[testIndex].result = result.toString();

          // Update variables if needed
          if (test.variable) {
            updatedVariables[test.variable] = result;
          }
        } catch (err) {
          console.error("Error evaluating formula:", err);
        }
      }
    });

    setTestResults(updatedResults);
    variablesRef.current = updatedVariables;
  };

  // Build dependency graph for formula evaluation
  const buildDependencyGraph = (results) => {
    const graph = [];
    const visited = new Set();

    const visit = (index) => {
      if (visited.has(index)) return;
      visited.add(index);

      const test = results[index];
      if (test.formula) {
        // Find dependencies for the formula
        const dependencies = results
          .map((t, i) => (t.variable && test.formula.includes(t.variable) ? i : -1))
          .filter((i) => i !== -1);

        // Visit dependencies recursively
        dependencies.forEach((depIndex) => visit(depIndex));
      }

      graph.push(index);
    };

    // Visit all tests
    results.forEach((_, index) => visit(index));

    return graph;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const testReportData = {
        patientId: "64f8e8f1e4b0d1a2b3c4d5e6", // Replace with dynamic patient ID
        invoiceId: "64f8e8f1e4b0d1a2b3c4d5e7", // Replace with dynamic invoice ID
        templateId: template._id,
        comment,
        completeStatus,
        repeatStatus,
        outSideStatus,
        testResults,
      };

      // Update the report
      const response = await axios.put(`http://localhost:5002/api/testReports/${id}`, testReportData);
      console.log("Update response:", response.data);
      alert("Test report updated successfully!");
      navigate(`/testReports/${id}`, { replace: true });
    } catch (err) {
      setError("Failed to update test report. Please try again.");
      console.error("Update error:", err.response?.data || err.message);
    }
  };

  // Show loading state if template is not fetched yet
  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Update Test Report</h1>
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

        {/* Status Fields */}
        <div className="space-y-2">
          <label className="block font-semibold">Status</label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={completeStatus}
                onChange={(e) => setCompleteStatus(e.target.checked)}
                className="mr-2"
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

        {/* Test Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Test Results</h2>
          {testResults.map((test, index) => (
            <div key={index} className="p-4 border rounded bg-white">
              <label className="block font-semibold">
                {test.testName} ({test.unit}):
              </label>
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
                  onWheel={handleWheel}
                  className="w-full p-2 border rounded"
                />
              )}
              <span className="text-gray-600">Normal Range: {test.normalRange}</span>
              {test.formula && <span className="text-sm text-gray-500">Formula: {test.formula}</span>}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Update Test Report
        </button>
      </form>

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default UpdateReport;