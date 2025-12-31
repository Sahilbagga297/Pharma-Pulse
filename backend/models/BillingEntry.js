import mongoose from "mongoose";

const billingEntrySchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  doctorDegree: { type: String, required: true },
  doctorLocation: { type: String, required: true },
  sampleUnits: { type: Number, required: true },
  totalOrderAmount: { type: Number, required: true },
  discountPercentage: { type: Number, required: true },
  netAmount: { type: Number, required: true },
  // Keep existing fields for backward compatibility
  totalAmount: { type: Number },
  amountToPay: { type: Number },
  mrAmount: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

// Function to get user-specific billing model
export const getUserBillingModel = (userId) => {
  const collectionName = `billing_${userId}`;
  return mongoose.model(collectionName, billingEntrySchema, collectionName);
};

// Default model for backward compatibility
export default mongoose.model("BillingEntry", billingEntrySchema);
