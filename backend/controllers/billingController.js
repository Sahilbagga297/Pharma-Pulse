
import ExcelJS from "exceljs";
import path from "path";
import os from "os";
import fs from "fs";
import { fileURLToPath } from "url";
import { getUserBillingModel } from "../models/BillingEntry.js"; // Updated import
import { UserProfile } from "../models/UserProfile.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------- Update Billing Entry by ID --------------------
export const updateBillingEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Get user-specific billing model
    const UserBillingModel = getUserBillingModel(userId);

    const entry = await UserBillingModel.findById(id);
    if (!entry) {
      return res.status(404).json({ 
        success: false,
        message: 'Entry not found.' 
      });
    }

    // Validate required fields
    if (updateData.doctorName && !updateData.doctorName.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Doctor name is required.' 
      });
    }

    if (updateData.doctorDegree && !updateData.doctorDegree.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Doctor degree is required.' 
      });
    }

    if (updateData.doctorLocation && !updateData.doctorLocation.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Doctor location is required.' 
      });
    }

    if (updateData.sampleUnits && (isNaN(updateData.sampleUnits) || parseFloat(updateData.sampleUnits) <= 0)) {
      return res.status(400).json({ 
        success: false,
        message: 'Sample units must be a valid number greater than 0.' 
      });
    }

    if (updateData.totalOrderAmount && (isNaN(updateData.totalOrderAmount) || parseFloat(updateData.totalOrderAmount) <= 0)) {
      return res.status(400).json({ 
        success: false,
        message: 'Total order amount must be a valid number greater than 0.' 
      });
    }

    if (updateData.discountPercentage && (isNaN(updateData.discountPercentage) || parseFloat(updateData.discountPercentage) < 0)) {
      return res.status(400).json({ 
        success: false,
        message: 'Discount percentage must be a valid number (0 or greater).' 
      });
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (key in entry) {
        entry[key] = updateData[key];
      }
    });
    
    await entry.save();
    res.status(200).json({ 
      success: true,
      message: 'Entry updated successfully!', 
      entry 
    });
  } catch (error) {
    console.error('Error updating billing entry:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update entry.', 
      error: error.message 
    });
  }
};

// -------------------- Delete Billing Entry by ID --------------------
export const deleteBillingEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get user-specific billing model
    const UserBillingModel = getUserBillingModel(userId);

    const entry = await UserBillingModel.findById(id);
    if (!entry) {
      return res.status(404).json({ 
        success: false,
        message: 'Entry not found.' 
      });
    }

    // Delete the entry
    await UserBillingModel.findByIdAndDelete(id);
    res.status(200).json({ 
      success: true,
      message: 'Entry deleted successfully!' 
    });
  } catch (error) {
    console.error('Error deleting billing entry:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete entry.', 
      error: error.message 
    });
  }
};

// -------------------- Save Entry to User-Specific Collection --------------------
export const saveBillingEntry = async (req, res) => {
  try {
    const { 
      doctorName, 
      doctorDegree, 
      doctorLocation,
      sampleUnits, 
      totalOrderAmount, 
      discountPercentage, 
      netAmount,
      // Keep existing fields for backward compatibility
      totalAmount, 
      amountToPay, 
      mrAmount 
    } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    // Get user-specific billing model
    const UserBillingModel = getUserBillingModel(userId);

    // Additional validation on the backend
    if (!doctorName || !doctorName.trim()) {
      return res.status(400).json({ message: "Doctor name is required." });
    }

    if (!doctorDegree || !doctorDegree.trim()) {
      return res.status(400).json({ message: "Doctor degree is required." });
    }

    if (!doctorLocation || !doctorLocation.trim()) {
      return res.status(400).json({ message: "Doctor location is required." });
    }

    if (!sampleUnits || isNaN(sampleUnits) || parseFloat(sampleUnits) <= 0) {
      return res.status(400).json({ message: "Sample units must be a valid number greater than 0." });
    }

    if (!totalOrderAmount || isNaN(totalOrderAmount) || parseFloat(totalOrderAmount) <= 0) {
      return res.status(400).json({ message: "Total order amount must be a valid number greater than 0." });
    }

    if (!discountPercentage || isNaN(discountPercentage) || parseFloat(discountPercentage) < 0) {
      return res.status(400).json({ message: "Discount percentage must be a valid number (0 or greater)." });
    }

    // Calculate net amount if not provided
    const calculatedNetAmount = netAmount || (parseFloat(totalOrderAmount) - (parseFloat(totalOrderAmount) * parseFloat(discountPercentage) / 100));

    if (calculatedNetAmount < 0) {
      return res.status(400).json({ message: "Net amount cannot be negative." });
    }

    const newEntry = new UserBillingModel({
      doctorName: doctorName.trim(),
      doctorDegree: doctorDegree.trim(),
      doctorLocation: doctorLocation.trim(),
      sampleUnits: parseFloat(sampleUnits),
      totalOrderAmount: parseFloat(totalOrderAmount),
      discountPercentage: parseFloat(discountPercentage),
      netAmount: calculatedNetAmount,
      // Keep existing fields for backward compatibility
      totalAmount: totalAmount ? parseFloat(totalAmount) : parseFloat(totalOrderAmount),
      amountToPay: amountToPay ? parseFloat(amountToPay) : calculatedNetAmount,
      mrAmount: mrAmount ? parseFloat(mrAmount) : (parseFloat(totalOrderAmount) - calculatedNetAmount),
      timestamp: new Date(),
    });

    await newEntry.save();

    res.status(200).json({ 
      success: true,
      message: "Data saved to your personal billing database successfully!",
      entry: newEntry
    });
  } catch (error) {
    console.error("Error saving data to user billing collection:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to save data.", 
      error: error.message 
    });
  }
};

// -------------------- Get All Entries from User-Specific Collection --------------------
export const getBillingEntries = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    
    // Get user-specific billing model
    const UserBillingModel = getUserBillingModel(userId);
    
    // Fetch entries from user's specific collection
    const entries = await UserBillingModel.find({}).sort({ timestamp: -1 });
    
    res.status(200).json({
      success: true,
      entries,
      totalEntries: entries.length,
      message: `Found ${entries.length} entries in your personal billing database`,
    });
  } catch (error) {
    console.error("Error fetching data from user billing collection:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch data.", 
      error: error.message 
    });
  }
};

// -------------------- Download Excel from User-Specific Collection --------------------
export const downloadExcel = async (req, res) => {
  console.log("Download Excel endpoint called");
  
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    
    // Get user-specific billing model
    const UserBillingModel = getUserBillingModel(userId);
    
    // Fetch entries from user's specific collection
    const entries = await UserBillingModel.find({}).sort({ timestamp: -1 });
    console.log(`Found ${entries.length} entries for user ${userId}`);

    if (entries.length === 0) {
      console.log("No entries found for user, returning 404");
      return res.status(404).json({ 
        success: false,
        message: "No data found in your personal billing database." 
      });
    }

    console.log("Creating Excel workbook...");
    // Create workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Billing Data");

    // Add headers with styling
    worksheet.columns = [
      { header: "Doctor Name", key: "doctorName", width: 25 },
      { header: "Doctor Degree", key: "doctorDegree", width: 20 },
      { header: "Doctor Location", key: "doctorLocation", width: 20 },
      { header: "Sample Units", key: "sampleUnits", width: 15 },
      { header: "Total Order Amount", key: "totalOrderAmount", width: 20 },
      { header: "Discount Percentage", key: "discountPercentage", width: 20 },
      { header: "Net Amount", key: "netAmount", width: 20 },
      { header: "Timestamp", key: "timestamp", width: 25 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }
    };

    // Add data to worksheet
    entries.forEach((entry) => {
      worksheet.addRow({
        doctorName: entry.doctorName || '',
        doctorDegree: entry.doctorDegree || '',
        doctorLocation: entry.doctorLocation || '',
        sampleUnits: entry.sampleUnits || 0,
        totalOrderAmount: entry.totalOrderAmount || 0,
        discountPercentage: entry.discountPercentage || 0,
        netAmount: entry.netAmount || 0,
        timestamp: entry.timestamp ? entry.timestamp.toISOString() : new Date().toISOString(),
      });
    });

    console.log("Excel data prepared, generating buffer...");
    
    // Generate Excel buffer instead of writing to file
    const buffer = await workbook.xlsx.writeBuffer();
    console.log("Excel buffer generated successfully");
    
    // Set proper headers for file download
    const fileName = `billing_data_user_${userId}_${Date.now()}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log("Sending Excel file for download...");
    
    // Send the buffer directly
    res.send(buffer);
    
    console.log("Excel file sent successfully");
    
  } catch (error) {
    console.error("Error generating Excel:", error);
    // Only send error response if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        message: "Failed to generate Excel.", 
        error: error.message 
      });
    }
  }
};

// -------------------- Create Sample Data for Testing (User-Specific) --------------------
export const createSampleData = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    console.log("Creating sample billing data for user:", userId);
    
    // Get user-specific billing model
    const UserBillingModel = getUserBillingModel(userId);
    
    const sampleEntries = [
      {
        doctorName: "Dr. John Smith",
        doctorDegree: "MBBS, MD",
        doctorLocation: "Mumbai",
        sampleUnits: 50,
        totalOrderAmount: 1500,
        discountPercentage: 10,
        netAmount: 1350,
        timestamp: new Date(),
      },
      {
        doctorName: "Dr. Sarah Johnson",
        doctorDegree: "MBBS, MS",
        doctorLocation: "Delhi",
        sampleUnits: 75,
        totalOrderAmount: 2000,
        discountPercentage: 15,
        netAmount: 1700,
        timestamp: new Date(),
      },
      {
        doctorName: "Dr. Michael Brown",
        doctorDegree: "MBBS, DNB",
        doctorLocation: "Bangalore",
        sampleUnits: 30,
        totalOrderAmount: 1200,
        discountPercentage: 5,
        netAmount: 1140,
        timestamp: new Date(),
      },
    ];

    // Clear existing data for this user and insert sample data
    await UserBillingModel.deleteMany({});
    await UserBillingModel.insertMany(sampleEntries);

    console.log("Sample data created successfully for user:", userId);
    res.status(200).json({ 
      success: true,
      message: "Sample data created successfully in your personal billing database", 
      count: sampleEntries.length 
    });
  } catch (error) {
    console.error("Error creating sample data:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create sample data.", 
      error: error.message 
    });
  }
};

// -------------------- Get User Profile --------------------
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data from User model to get email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let profile = await UserProfile.findOne({ userId });

    if (!profile) {
      // If no profile exists, create a blank one with user's email
      profile = new UserProfile({ 
        userId, 
        name: user.name || "New User", 
        email: user.email 
      });
      await profile.save();
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch profile.", error: error.message });
  }
};

// -------------------- Update User Profile --------------------
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, designation } = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { name, email, phone, address, designation },
      { new: true, upsert: true } // create if not exists
    );

    res.status(200).json({ message: "Profile updated successfully!", profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile.", error: error.message });
  }
};

// -------------------- Increment Doctor Visit --------------------
export const addDoctorVisit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorName, doctorDegree } = req.body;

    // Get user data from User model to get email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = new UserProfile({ 
        userId, 
        name: user.name || "New User", 
        email: user.email 
      });
    }

    // Check if doctor already exists in visits
    const doctor = profile.doctorVisits.find(
      (d) => d.doctorName === doctorName && d.doctorDegree === doctorDegree
    );

    if (doctor) {
      doctor.noOfVisits += 1;
    } else {
      profile.doctorVisits.push({ doctorName, doctorDegree, noOfVisits: 1 });
    }

    await profile.save();
    res.status(200).json({ message: "Doctor visit recorded!", profile });
  } catch (error) {
    console.error("Error recording doctor visit:", error);
    res.status(500).json({ message: "Failed to record visit.", error: error.message });
  }
};

// -------------------- Update Doctor Visits --------------------
export const updateDoctorVisits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorVisits } = req.body;

    // Get user data from User model to get email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = new UserProfile({ 
        userId, 
        name: user.name || "New User", 
        email: user.email 
      });
    }

    // Update the doctor visits array
    profile.doctorVisits = doctorVisits;
    await profile.save();

    res.status(200).json({ message: "Doctor visits updated successfully!", profile });
  } catch (error) {
    console.error("Error updating doctor visits:", error);
    res.status(500).json({ message: "Failed to update visits.", error: error.message });
  }
};

// -------------------- Delete Doctor Visit --------------------
export const deleteDoctorVisit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { visitIndex } = req.body;

    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    // Check if visit index is valid
    if (visitIndex < 0 || visitIndex >= profile.doctorVisits.length) {
      return res.status(400).json({ message: "Invalid visit index." });
    }

    // Get the doctor information before deleting
    const doctorToDelete = profile.doctorVisits[visitIndex];
    
    // Remove the visit at the specified index
    profile.doctorVisits.splice(visitIndex, 1);
    await profile.save();

    // Also delete the doctor from the Doctor collection if it exists
    if (doctorToDelete && doctorToDelete.doctorName && doctorToDelete.doctorDegree) {
      try {
        const Doctor = (await import('../models/Doctor.js')).default;
        await Doctor.deleteOne({
          user: userId,
          name: doctorToDelete.doctorName,
          degree: doctorToDelete.doctorDegree
        });
        console.log(`Deleted doctor ${doctorToDelete.doctorName} from Doctor collection`);
      } catch (doctorDeleteError) {
        console.error("Error deleting doctor from Doctor collection:", doctorDeleteError);
        // Don't fail the entire operation if doctor deletion fails
      }
    }

    res.status(200).json({ message: "Doctor visit deleted successfully!", profile });
  } catch (error) {
    console.error("Error deleting doctor visit:", error);
    res.status(500).json({ message: "Failed to delete visit.", error: error.message });
  }
};

// -------------------- Get Doctor Business Summary --------------------
export const getDoctorBusinessSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Getting business summary for user:', userId);
    
    // Get user-specific billing model
    const UserBillingModel = getUserBillingModel(userId);
    console.log('User billing model created for collection: billing_' + userId);
    
    // Get all billing entries for the user
    const billingEntries = await UserBillingModel.find({}).sort({ timestamp: -1 });
    console.log('Found billing entries:', billingEntries.length);
    
    // Filter out entries with missing or invalid data
    const validBillingEntries = billingEntries.filter(entry => 
      entry.doctorName && 
      entry.doctorDegree && 
      typeof entry.doctorName === 'string' && 
      typeof entry.doctorDegree === 'string' &&
      entry.doctorName.trim() !== '' && 
      entry.doctorDegree.trim() !== ''
    );
    
    console.log('Valid billing entries (after filtering):', validBillingEntries.length);
    
    // Log the structure of first few entries for debugging
    if (validBillingEntries.length > 0) {
      console.log('Sample billing entry structure:', {
        doctorName: validBillingEntries[0].doctorName,
        doctorDegree: validBillingEntries[0].doctorDegree,
        totalOrderAmount: validBillingEntries[0].totalOrderAmount,
        netAmount: validBillingEntries[0].netAmount,
        sampleUnits: validBillingEntries[0].sampleUnits
      });
    }
    
    // Get user data from User model to get email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get user profile with doctor visits
    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      console.log('No profile found, creating new one');
      profile = new UserProfile({ 
        userId, 
        name: user.name || "New User", 
        email: user.email 
      });
      await profile.save();
    }
    console.log('Profile found/created with doctor visits:', profile.doctorVisits?.length || 0);
    
    // Log the structure of doctor visits for debugging
    if (profile.doctorVisits && profile.doctorVisits.length > 0) {
      console.log('Sample doctor visit structure:', {
        doctorName: profile.doctorVisits[0].doctorName,
        doctorDegree: profile.doctorVisits[0].doctorDegree,
        noOfVisits: profile.doctorVisits[0].noOfVisits
      });
    }

    // Calculate business summary for each doctor in visits
    const doctorBusinessSummary = profile.doctorVisits
      .filter(visit => visit && visit.doctorName && visit.doctorDegree) // Filter out invalid visits
      .map(visit => {
        console.log('Processing visit for doctor:', visit.doctorName);
        
        // Find all billing entries for this doctor
        const doctorEntries = validBillingEntries.filter(entry => 
          entry.doctorName && 
          entry.doctorDegree && 
          visit.doctorName && 
          visit.doctorDegree &&
          entry.doctorName.toLowerCase() === visit.doctorName.toLowerCase() &&
          entry.doctorDegree.toLowerCase() === visit.doctorDegree.toLowerCase()
        );
        
        console.log('Found billing entries for doctor:', visit.doctorName, 'Count:', doctorEntries.length);

        // Calculate totals with safety checks
        const totalOrders = doctorEntries.length;
        const totalAmount = doctorEntries.reduce((sum, entry) => sum + (entry.totalOrderAmount || 0), 0);
        const totalNetAmount = doctorEntries.reduce((sum, entry) => sum + (entry.netAmount || 0), 0);
        const totalDiscount = doctorEntries.reduce((sum, entry) => sum + ((entry.totalOrderAmount || 0) - (entry.netAmount || 0)), 0);
        const totalSampleUnits = doctorEntries.reduce((sum, entry) => sum + (entry.sampleUnits || 0), 0);

        return {
          doctorName: visit.doctorName,
          doctorDegree: visit.doctorDegree,
          noOfVisits: visit.noOfVisits,
          businessSummary: {
            totalOrders,
            totalAmount,
            totalNetAmount,
            totalDiscount,
            totalSampleUnits,
            averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0,
            averageNetValue: totalOrders > 0 ? totalNetAmount / totalOrders : 0
          },
          recentOrders: doctorEntries.slice(0, 5) // Last 5 orders
        };
      });

    console.log('Final business summary:', doctorBusinessSummary);
    res.status(200).json({ 
      message: "Doctor business summary retrieved successfully!", 
      doctorBusinessSummary 
    });
  } catch (error) {
    console.error("Error getting doctor business summary:", error);
    res.status(500).json({ message: "Failed to get business summary.", error: error.message });
  }
};

// -------------------- Get Sales Reports --------------------
export const getSalesReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period } = req.query;
    
    // Get user-specific billing model
    const UserBillingModel = getUserBillingModel(userId);
    
    // Calculate date range based on period
    let startDate = new Date();
    let endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    // Build query
    const query = period === 'all' ? {} : { timestamp: { $gte: startDate, $lte: endDate } };
    
    // Get billing entries for the period
    const entries = await UserBillingModel.find(query).sort({ timestamp: -1 });
    
    // Calculate summary statistics
    const totalSales = entries.reduce((sum, entry) => sum + (entry.totalOrderAmount || 0), 0);
    const totalNetSales = entries.reduce((sum, entry) => sum + (entry.netAmount || 0), 0);
    const totalOrders = entries.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get unique doctors from this user's entries only
    const uniqueDoctors = [...new Set(entries.map(entry => `${entry.doctorName}-${entry.doctorDegree}`))];
    const activeDoctors = uniqueDoctors.length;

    // Calculate top performing doctors (from this user's entries only)
    const doctorStats = {};
    entries.forEach(entry => {
      const key = `${entry.doctorName}-${entry.doctorDegree}`;
      if (!doctorStats[key]) {
        doctorStats[key] = {
          doctorName: entry.doctorName,
          doctorDegree: entry.doctorDegree,
          totalSales: 0,
          orderCount: 0
        };
      }
      doctorStats[key].totalSales += entry.totalOrderAmount || 0;
      doctorStats[key].orderCount += 1;
    });

    const topDoctors = Object.values(doctorStats)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    // Get recent sales (last 20)
    const recentSales = entries.slice(0, 20);

    const reportData = {
      period,
      totalSales,
      totalNetSales,
      totalOrders,
      averageOrderValue,
      activeDoctors,
      topDoctors,
      recentSales,
      generatedAt: new Date()
    };

    res.status(200).json({
      message: "Sales report generated successfully!",
      ...reportData
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ message: "Failed to generate report.", error: error.message });
  }
};

// -------------------- Download Sales Report --------------------
export const downloadSalesReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period, format } = req.query;
    
    // Get user-specific billing model
    const UserBillingModel = getUserBillingModel(userId);
    
    // Calculate date range based on period
    let startDate = new Date();
    let endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    // Build query
    const query = period === 'all' ? {} : { timestamp: { $gte: startDate, $lte: endDate } };
    
    // Get billing entries for the period
    const entries = await UserBillingModel.find(query).sort({ timestamp: -1 });
    
    if (format === 'excel') {
      // Generate Excel report
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");
      
      // Add headers
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Doctor Name", key: "doctorName", width: 25 },
        { header: "Doctor Degree", key: "doctorDegree", width: 20 },
        { header: "Doctor Location", key: "doctorLocation", width: 20 },
        { header: "Sample Units", key: "sampleUnits", width: 15 },
        { header: "Total Amount", key: "totalAmount", width: 18 },
        { header: "Discount %", key: "discountPercentage", width: 15 },
        { header: "Net Amount", key: "netAmount", width: 18 },
        { header: "Timestamp", key: "timestamp", width: 20 }
      ];
      
      // Add data
      entries.forEach(entry => {
        worksheet.addRow({
          date: entry.timestamp.toLocaleDateString(),
          doctorName: entry.doctorName,
          doctorDegree: entry.doctorDegree,
          doctorLocation: entry.doctorLocation || '',
          sampleUnits: entry.sampleUnits,
          totalAmount: entry.totalOrderAmount,
          discountPercentage: entry.discountPercentage,
          netAmount: entry.netAmount,
          timestamp: entry.timestamp.toISOString()
        });
      });
      
      // Add summary row
      const totalSales = entries.reduce((sum, entry) => sum + entry.totalOrderAmount, 0);
      const totalNetSales = entries.reduce((sum, entry) => sum + entry.netAmount, 0);
      const totalOrders = entries.length;
      
      worksheet.addRow([]);
      worksheet.addRow(["SUMMARY", "", "", "", "", "", "", "", ""]);
      worksheet.addRow(["Total Orders", "", "", "", totalOrders, "", "", "", ""]);
      worksheet.addRow(["Total Sales", "", "", "", "", totalSales, "", "", ""]);
      worksheet.addRow(["Total Net Sales", "", "", "", "", "", "", totalNetSales, ""]);
      
      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${period}-${Date.now()}.xlsx`);
      
      // Send the workbook
      await workbook.xlsx.write(res);
    } else {
      // For now, just send JSON for PDF (you can implement PDF generation later)
      res.status(200).json({ 
        message: "PDF generation not implemented yet. Use Excel format.",
        entries: entries.slice(0, 100) // Limit to first 100 entries for JSON response
      });
    }
  } catch (error) {
    console.error("Error downloading sales report:", error);
    res.status(500).json({ message: "Failed to download report.", error: error.message });
  }
};

// -------------------- Clean Corrupted Billing Data --------------------
export const cleanCorruptedBillingData = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Cleaning corrupted billing data for user:', userId);
    
    // Get user-specific billing model
    const UserBillingModel = getUserBillingModel(userId);
    
    // Find and remove entries with missing or invalid data
    const result = await UserBillingModel.deleteMany({
      $or: [
        { doctorName: { $exists: false } },
        { doctorName: null },
        { doctorName: "" },
        { doctorDegree: { $exists: false } },
        { doctorDegree: null },
        { doctorDegree: "" }
      ]
    });
    
    console.log('Cleaned corrupted entries:', result.deletedCount);
    
    res.status(200).json({ 
      message: "Corrupted billing data cleaned successfully!", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Error cleaning corrupted billing data:", error);
    res.status(500).json({ message: "Failed to clean corrupted data.", error: error.message });
  }
};
