import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    testName: { type: String, required: true },
    category: { type: Number, required: true },
    showCorrectAnswers: { type: Boolean, required: true },
    description: { type: String },
  },
  { timestamps: true },
);

const Test = mongoose.model('Test', testSchema);

export default Test;
