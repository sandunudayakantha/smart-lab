import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { evaluate } from "mathjs";

const UpdateReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [comment, setComment] = useState("");
  const [repeatStatus, setRepeatStatus] = useState(false);
  const [outSideStatus, setOutSideStatus] = useState(false);
  const [error, setError] = useState("");
  const variablesRef = useRef({});

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:5002/api/testReports/${id}`);
        setReport(response.data);
        setComment(response.data.comment);
        setRepeatStatus(response.data.repeatStatus);
        setOutSideStatus(response.data.outSideStatus);
        setTestResults(response.data.testResults);
      } catch (err) {
        setError("Failed to fetch test report");
        console.error(err);
      }
    };

    fetchReport();
  }, [id]);

  const handleInputChange = (index, value) => {
    const updatedResults = [...testResults];
    let parsedValue = parseFloat(value) || 0;

    if (!isNaN(parsedValue)) {
      parsedValue = parseFloat(parsedValue.toFixed(1));
    }

    updatedResults[index].result = parsedValue;

    if (updatedResults[index].variable) {
      variablesRef.current[updatedResults[index].variable] = parsedValue;
    }

    setTestResults(updatedResults);
    evaluateFormulas(updatedResults);
  };

  const evaluateFormulas = (results) => {
    const updatedResults = [...results];
    const updatedVariables = { ...variablesRef.current };
    const dependencyGraph = buildDependencyGraph(updatedResults);

    dependencyGraph.forEach((testIndex) => {
      const test = updatedResults[testIndex];
      if (test.formula) {
        try {
          let result = evaluate(test.formula, updatedVariables);
          result = parseFloat(result.toFixed(1));
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
          .filter((i) => i !== -1);
        dependencies.forEach((depIndex) => visit(depIndex));
      }
      graph.push(index);
    };

    results.forEach((_, index) => visit(index));
    return graph;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        comment,
        repeatStatus,
        outSideStatus,
        testResults,
      };

      await axios.put(`http://localhost:5002/api/testReports/${id}`, updatedData);
      alert("Test report updated successfully!");
      navigate(`/testReports/${id}`);
    } catch (err) {
      setError("Failed to update test report");
      console.error(err);
    }
  };

  if (!report) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Update Test Report</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="space-y-2">
          <label className="block font-semibold">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-semibold">Status</label>
          <div className="flex items-center space-x-4">
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

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Test Results</h2>
          {testResults.map((test, index) => (
            <div key={index} className="p-4 border rounded bg-white">
              <label className="block font-semibold">
                {test.testName} ({test.unit}):
              </label>
              <input
                type="number"
                value={test.result}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="w-full p-2 border rounded"
              />
              <span className="text-gray-600">Normal Range: {test.normalRange}</span>
            </div>
          ))}
        </div>

        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Update Test Report
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default UpdateReport;
