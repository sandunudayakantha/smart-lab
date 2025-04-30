import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { evaluate } from "mathjs";

const CreateReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [template, setTemplate] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [comment, setComment] = useState("");
  const [completeStatus, setCompleteStatus] = useState(false);
  const [repeatStatus, setRepeatStatus] = useState(false);
  const [outSideStatus, setOutSideStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const variablesRef = useRef({});
  const [patientId, setPatientId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [patientName, setPatientName] = useState("");

  // Set the patientId and invoiceId from location state when component mounts
  useEffect(() => {
    if (location.state) {
      console.log('Setting data from location state:', location.state);
      setPatientId(location.state.patientId);
      setInvoiceId(location.state.invoiceId);
      setPatientName(location.state.patientName);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`http://localhost:5002/api/testTemplates/${id}`);
        setTemplate(response.data);
        initializeTestResults(response.data.tests);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch template");
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const initializeTestResults = (tests) => {
    const initialResults = tests.map(test => ({
      testName: test.testName,
      result: "",
      unit: test.unit,
      normalRange: test.normalRange,
      inputType: test.inputType,
      options: test.options,
      formula: test.formula,
      variable: test.variable
    }));
    setTestResults(initialResults);
  };

  const handleInputChange = (index, value) => {
    const updatedResults = [...testResults];
    let parsedValue = parseFloat(value) || 0;
    
    if (!isNaN(parsedValue)) {
      parsedValue = parseFloat(parsedValue.toFixed(1)); // Round to one decimal place
    }
    
    updatedResults[index].result = parsedValue;
    
    if (updatedResults[index].variable) {
      variablesRef.current[updatedResults[index].variable] = parsedValue;
    }
    
    setTestResults(updatedResults);
    evaluateFormulas(updatedResults);
  };

  const handleWheel = (e) => {
    e.target.blur();
  };

  const evaluateFormulas = (results) => {
    const updatedResults = [...results];
    const updatedVariables = { ...variablesRef.current };

    const dependencyGraph = buildDependencyGraph(updatedResults);

    dependencyGraph.forEach(testIndex => {
      const test = updatedResults[testIndex];
      if (test.formula) {
        try {
          let result = evaluate(test.formula, updatedVariables);
          result = parseFloat(result.toFixed(1)); // Round to one decimal place
          updatedResults[testIndex].result = result.toString();
          
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

  const buildDependencyGraph = (results) => {
    const graph = [];
    const visited = new Set();

    const visit = (index) => {
      if (visited.has(index)) return;
      visited.add(index);

      const test = results[index];
      if (test.formula) {
        const dependencies = results
          .map((t, i) => (t.variable && test.formula.includes(t.variable) ? i : -1))
          .filter(i => i !== -1);

        dependencies.forEach(depIndex => visit(depIndex));
      }

      graph.push(index);
    };

    results.forEach((_, index) => visit(index));

    return graph;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate data before submission
      if (!patientId || !invoiceId) {
        console.error('Missing data:', { patientId, invoiceId });
        setError("Missing required patient or invoice information");
        return;
      }

      // Validate test results
      const hasEmptyResults = testResults.some(test => test.result === "");
      if (hasEmptyResults) {
        setError("Please fill in all test results");
        return;
      }

      const testReportData = {
        templateId: id,
        patientId: patientId,
        invoiceId: invoiceId,
        testResults,
        comment,
        completeStatus: true, // Always set to true when submitting
        repeatStatus,
        outSideStatus
      };

      console.log('Submitting test report data:', testReportData);

      // First create the test report
      await axios.post('http://localhost:5002/api/testReports', testReportData);
      
      // Then mark the test as completed in the invoice
      try {
        await axios.put(`http://localhost:5002/api/invoices/${invoiceId}/complete-test/${id}`);
        console.log('Test marked as completed in invoice');
      } catch (invoiceErr) {
        console.error('Error marking test as completed:', invoiceErr);
        // Don't fail the whole operation if invoice update fails
      }

      setSuccess("Test report created successfully!");
      setTimeout(() => {
        navigate("/reports");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create test report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Test Report</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Patient Information</h2>
          <p className="text-gray-700">Name: {patientName}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Template: {template.templateName}</h2>
          
          <div className="space-y-2">
            <label className="block font-semibold">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter additional notes"
            />
          </div>

          <div className="space-y-2 mt-4">
            <label className="block font-semibold">Status</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input type="checkbox" checked={completeStatus} onChange={(e) => setCompleteStatus(e.target.checked)} className="mr-2" disabled />
                Complete Status
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={repeatStatus} onChange={(e) => setRepeatStatus(e.target.checked)} className="mr-2" />
                Repeat Status
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={outSideStatus} onChange={(e) => setOutSideStatus(e.target.checked)} className="mr-2" />
                Outside Status
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div key={index} className="p-4 border rounded bg-gray-50">
                <label className="block font-semibold mb-2">
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
                <div className="mt-2 text-sm text-gray-600">
                  <p>Normal Range: {test.normalRange}</p>
                  {test.formula && <p className="text-gray-500">Formula: {test.formula}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Test Report"}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
};

export default CreateReport;
