import express from 'express';
const router = express.Router();

// Import controllers
import {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';

// Routes
router.post('/create/', createFeedback); // Create feedback
router.get('/get/', getFeedbacks); // Get all feedbacks
router.get('/getbyid/:id', getFeedbackById); // Get a single feedback by ID
router.put('/update/:id', updateFeedback); // Update feedback by ID
router.delete('/delete/:id', deleteFeedback); // Delete feedback by ID

export default router;


//daaanna package.json ak