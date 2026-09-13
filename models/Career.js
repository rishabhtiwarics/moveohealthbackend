import mongoose from "mongoose";

const careerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
    },
    resumeLink: {
      type: String,
    },
    coverLetter: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Career", careerSchema);
