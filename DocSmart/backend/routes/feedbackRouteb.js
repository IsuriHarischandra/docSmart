import express from 'express';
import {
    submitFeedback,
    getDoctorFeedbacks,
    getAllFeedbacks,
    getUserFeedbacks,
    deleteFeedback
} from '../controllers/feedbackController.js';

const router = express.Router();

// User routes
router.post('/submit', submitFeedback);
router.get('/user/:userId', getUserFeedbacks);
router.get('/doctor/:doctorId', getDoctorFeedbacks);

// Admin routes
router.get('/all', getAllFeedbacks);
router.delete('/:feedbackId', deleteFeedback);

export default router;