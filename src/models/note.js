import mongoose from "mongoose";
import { TAGS } from "../constants/tags.js";

const noteSchema = new mongoose.Schema(
  {
    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
},
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      required: false,
      enum: TAGS,
      default: 'Todo',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
noteSchema.index({ title: 'text', content: 'text' });
export const Note = mongoose.model("Note", noteSchema);