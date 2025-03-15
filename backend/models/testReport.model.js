import mongoose from "mongoose";

const TestReportSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Patient", 
    required: true 
  },
  invoiceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Invoice", 
    required: true 
  },
  templateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TestTemplate", // Ensure this matches your actual template model name
    required: true
  },
  comment: { type: String, default: "" }, // Additional notes
  completeStatus: { type: Boolean, default: false }, // Whether the test is completed
  repeatStatus: { type: Boolean, default: false }, // Whether the test was repeated
  outSideStatus: { type: Boolean, default: false }, // Whether the test came from an external lab
  testResults: [
    {
      testName: { type: String, required: true },
      result: { type: mongoose.Schema.Types.Mixed, required: true }, // Can store number, text, etc.
      unit: { type: String, default: "" }, 
      normalRange: { type: String, default: "" }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const TestReport = mongoose.model("TestReport", TestReportSchema);

export default TestReport;
