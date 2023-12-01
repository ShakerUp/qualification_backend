import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true },
);

const Book = mongoose.model('Book', bookSchema);

export default Book;
