import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    fullName: {
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
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Consultation", consultationSchema);
