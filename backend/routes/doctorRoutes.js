
import express from "express";
import auth from "../middleware/authmidleware.js";
import { addDoctor, getDoctors, updateDoctor } from "../controllers/doctorController.js";

const router = express.Router();

// Add a new doctor
router.post("/", auth, addDoctor);
// Get all doctors for the logged-in user
router.get("/", auth, getDoctors);
// Update a doctor for the logged-in user
router.put("/", auth, updateDoctor);

export default router;
