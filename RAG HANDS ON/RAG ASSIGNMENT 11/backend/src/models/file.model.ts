import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  userId: String,
  fileName: String,
  status: {
    type: String,
    enum: ["PROCESSING", "COMPLETED", "FAILED"],
    default: "PROCESSING",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const FileModel = mongoose.model("File", FileSchema);
