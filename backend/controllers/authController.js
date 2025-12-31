import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  
  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({ message: "Please provide a valid email" });
  }
  
  try{
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }       
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    const payload = {
      user: {
        id: user._id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({
      token,
    });
  }catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email address" });
    };
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password. Please check your credentials" });
    }
    const payload = {
      user: {
        id: user._id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",  
    });
    res.status(200).json({
      token,
    });
    } catch (error) {  
        res.status(500).json({ message: "Server error" }); 
    }
};
export const logout = (req, res) => {
  // Invalidate the token on the client side
  res.status(200).json({ message: "Logged out successfully. Please remove the token on the client side " });
};
export const viewusers = async (req, res) => {
  try {
    const users = await User.find({}); 
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

