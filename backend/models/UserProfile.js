import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true }, // link to main user
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  designation: { type: String }, // optional, e.g., MR designation
  doctorVisits: [
    {
      doctorName: String,
      doctorDegree: String,
      noOfVisits: { type: Number, default: 0 },
    }
  ],
}, { timestamps: true });

export const UserProfile = mongoose.model("UserProfile", userProfileSchema);
