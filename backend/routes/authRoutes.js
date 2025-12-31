import express from 'express';
import { register , login, logout , viewusers } from '../controllers/authController.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/viewusers' , viewusers);
export default router;