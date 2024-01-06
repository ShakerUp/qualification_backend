import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    testName: { type: String, required: true },
    category: { type: Number, required: true },
    showCorrectAnswers: { type: Boolean, required: true },
    description: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    numberOfQuestions: { type: Number, required: true },
    timesDone: { type: Number, required: true },
  },
  { timestamps: true },
);

const Test = mongoose.model('Test', testSchema);

export default Test;
