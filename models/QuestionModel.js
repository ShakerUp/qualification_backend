import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionType: { type: String, required: true },
    questionText: { type: String, required: true },
    options: { type: [String] },
    correctAnswer: { type: [String] },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  },
  { timestamps: true },
);

const Question = mongoose.model('Question', questionSchema);

export default Question;
