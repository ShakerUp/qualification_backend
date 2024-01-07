// Create a mongoose schema for the test results
import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    testName: { type: String, required: true },
    correctAnswers: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    mark: { type: Number, required: true },
    userAnswers: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  },
);

// Create a model from the schema
const TestResult = mongoose.model('TestResult', testResultSchema);

export default TestResult;
