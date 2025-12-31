
import express from "express";
import auth from "../middleware/authmidleware.js";
import {
  saveBillingEntry,
  getBillingEntries,
  downloadExcel,
  createSampleData,
  updateBillingEntry,
  deleteBillingEntry,
  getUserProfile,
  updateUserProfile,
  addDoctorVisit,
  updateDoctorVisits,
  deleteDoctorVisit,
  getDoctorBusinessSummary,
  cleanCorruptedBillingData,
  getSalesReports,
  downloadSalesReport
} from "../controllers/billingController.js";

const router = express.Router();

// Apply auth middleware to all billing routes
router.post("/save", auth, saveBillingEntry);       // Save to MongoDB
router.get("/all", auth, getBillingEntries);        // Fetch from MongoDB
router.get("/download", auth, downloadExcel);       // Download Excel from MongoDB
router.post("/create-sample", auth, createSampleData);    // Create sample data for testing
router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, updateUserProfile);
router.post("/profile/visit", auth, addDoctorVisit);
router.put("/profile/visits/update", auth, updateDoctorVisits);
router.delete("/profile/visit", auth, deleteDoctorVisit);
router.get("/profile/business-summary", auth, getDoctorBusinessSummary);
router.post("/clean-corrupted-data", auth, cleanCorruptedBillingData);
router.get("/reports", auth, getSalesReports);
router.get("/reports/download", auth, downloadSalesReport);



// Update a billing entry by ID (must be after specific routes)
router.put("/:id", auth, updateBillingEntry);

// Delete a billing entry by ID (must be after specific routes)
router.delete("/:id", auth, deleteBillingEntry);

export default router;
