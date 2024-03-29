import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true, unique: true },
    viewsCount: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    updated: { type: Boolean, required: true, default: false },
    forms: { type: Array, required: true },
    imageUrl: String,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Post', PostSchema);
