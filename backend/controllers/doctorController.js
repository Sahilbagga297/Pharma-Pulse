
import Doctor from "../models/Doctor.js";

// Add a new doctor for the logged-in user
export const addDoctor = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, degree, location } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Doctor name is required." });
    }
    
    if (!degree || !degree.trim()) {
      return res.status(400).json({ message: "Doctor degree is required." });
    }
    
    if (!location || !location.trim()) {
      return res.status(400).json({ message: "Doctor location is required." });
    }
    
    // Check if doctor already exists for this user
    const trimmedName = name.trim();
    const trimmedDegree = degree.trim();
    const trimmedLocation = location.trim();
    
    const existingDoctor = await Doctor.findOne({
      user: userId,
      name: trimmedName,
      degree: trimmedDegree,
      location: trimmedLocation
    });
    
    if (existingDoctor) {
      return res.status(409).json({ 
        message: "Doctor already exists!",
        doctor: existingDoctor
      });
    }
    
    const doctor = new Doctor({ 
      name: trimmedName, 
      degree: trimmedDegree, 
      location: trimmedLocation,
      user: userId 
    });
    await doctor.save();
    res.status(201).json({ message: "Doctor added successfully!", doctor });
  } catch (error) {
    res.status(500).json({ message: "Failed to add doctor.", error: error.message });
  }
};

// Get all doctors for the logged-in user
export const getDoctors = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctors = await Doctor.find({ user: userId });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch doctors.", error: error.message });
  }
};

// Update a doctor for the logged-in user
export const updateDoctor = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldName, newName, degree, location } = req.body;
    
    // Validate required fields
    if (!oldName || !oldName.trim()) {
      return res.status(400).json({ message: "Old doctor name is required." });
    }
    
    if (!newName || !newName.trim()) {
      return res.status(400).json({ message: "New doctor name is required." });
    }
    
    if (!degree || !degree.trim()) {
      return res.status(400).json({ message: "Doctor degree is required." });
    }
    
    if (!location || !location.trim()) {
      return res.status(400).json({ message: "Doctor location is required." });
    }
    
    const trimmedOldName = oldName.trim();
    const trimmedNewName = newName.trim();
    const trimmedDegree = degree.trim();
    const trimmedLocation = location.trim();
    
    // Find the doctor to update
    const doctorToUpdate = await Doctor.findOne({
      user: userId,
      name: trimmedOldName
    });
    
    if (!doctorToUpdate) {
      return res.status(404).json({ message: "Doctor not found." });
    }
    
    // Check if new name already exists (excluding the current doctor)
    if (trimmedOldName !== trimmedNewName) {
      const existingDoctor = await Doctor.findOne({
        user: userId,
        name: trimmedNewName,
        _id: { $ne: doctorToUpdate._id }
      });
      
      if (existingDoctor) {
        return res.status(409).json({ 
          message: "A doctor with this name already exists!",
          doctor: existingDoctor
        });
      }
    }
    
    // Update the doctor
    doctorToUpdate.name = trimmedNewName;
    doctorToUpdate.degree = trimmedDegree;
    doctorToUpdate.location = trimmedLocation;
    
    await doctorToUpdate.save();
    
    res.status(200).json({ 
      message: "Doctor updated successfully!", 
      doctor: doctorToUpdate 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update doctor.", error: error.message });
  }
};

