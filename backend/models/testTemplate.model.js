import mongoose from "mongoose";

const TestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  unit: { type: String, default: "" },
  normalRange: { type: String, default: "" },
  inputType: { type: String, enum: ["text", "number", "select"], required: true },
  options: { type: [String], default: undefined }, // Only for select input types
  formula: { type: String, default: null },
  variable: { type: String, default: null }, // Variable name used in formulas
  chemicalCode: { type: String, default: "" }
});

const TemplateSchema = new mongoose.Schema({
  templateName: { type: String, required: true },
  shortName: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  specimenType: { type: String, required: true },
  tests: { type: [TestSchema], required: true },
  createdAt: { type: Date, default: Date.now }
});

const TestTemplate = mongoose.model("TestTemplate", TemplateSchema);

export default TestTemplate;
