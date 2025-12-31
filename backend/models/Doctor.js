import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  degree: { type: String },
  location: { type: String },
  visits: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Add other fields as needed
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
