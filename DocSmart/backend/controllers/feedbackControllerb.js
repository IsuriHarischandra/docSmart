import feedbackModel from "../models/feedbackModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";

// API to submit feedback
const submitFeedback = async (req, res) => {
    try {
        const { userId, appointmentId, rating, comment } = req.body;

        // Validate required fields
        if (!userId || !appointmentId || !rating) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields (userId, appointmentId, rating)" 
            });
        }

        // Validate rating range (1-5)
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false, 
                message: "Rating must be between 1 and 5" 
            });
        }

        // Check if appointment exists and belongs to the user
        const appointment = await appointmentModel.findOne({
            _id: appointmentId,
            userId: userId
        });

        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                message: "Appointment not found or doesn't belong to this user" 
            });
        }

        // Check if appointment is completed (only allow feedback for completed appointments)
        if (!appointment.isCompleted) {
            return res.status(400).json({ 
                success: false, 
                message: "Feedback can only be submitted for completed appointments" 
            });
        }

        // Check if feedback already exists for this appointment
        const existingFeedback = await feedbackModel.findOne({ appointmentId });
        if (existingFeedback) {
            return res.status(400).json({ 
                success: false, 
                message: "Feedback already submitted for this appointment" 
            });
        }

        // Get user and doctor details
        const user = await userModel.findById(userId).select('name image');
        const doctor = await doctorModel.findById(appointment.docId).select('name image');

        // Create feedback
        const feedbackData = {
            userId,
            userDetails: {
                name: user.name,
                image: user.image
            },
            doctorId: appointment.docId,
            doctorDetails: {
                name: doctor.name,
                image: doctor.image
            },
            appointmentId,
            rating,
            comment: comment || "",
            date: new Date()
        };

        const newFeedback = new feedbackModel(feedbackData);
        await newFeedback.save();

        // Update doctor's average rating
        await updateDoctorRating(appointment.docId);

        res.status(201).json({ 
            success: true, 
            message: "Feedback submitted successfully",
            feedback: newFeedback
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Helper function to update doctor's average rating
const updateDoctorRating = async (doctorId) => {
    try {
        const feedbacks = await feedbackModel.find({ doctorId });
        
        if (feedbacks.length > 0) {
            const totalRatings = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
            const averageRating = totalRatings / feedbacks.length;
            
            await doctorModel.findByIdAndUpdate(doctorId, { 
                averageRating: parseFloat(averageRating.toFixed(1)),
                totalRatings: feedbacks.length
            });
        }
    } catch (error) {
        console.error("Error updating doctor rating:", error);
    }
};

// API to get feedbacks for a doctor
const getDoctorFeedbacks = async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        // Validate doctor exists
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ 
                success: false, 
                message: "Doctor not found" 
            });
        }

        const feedbacks = await feedbackModel.find({ doctorId })
            .sort({ date: -1 }) // Sort by newest first
            .limit(20); // Limit to 20 most recent feedbacks

        res.status(200).json({ 
            success: true, 
            feedbacks,
            averageRating: doctor.averageRating || 0,
            totalRatings: doctor.totalRatings || 0
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// API to get feedbacks for admin dashboard
const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find({})
            .sort({ date: -1 }) // Sort by newest first
            .limit(50); // Limit to 50 most recent feedbacks

        res.status(200).json({ 
            success: true, 
            feedbacks 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// API to get user's feedback history
const getUserFeedbacks = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Validate user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        const feedbacks = await feedbackModel.find({ userId })
            .sort({ date: -1 }) // Sort by newest first
            .populate('doctorId', 'name image'); // Populate doctor details

        res.status(200).json({ 
            success: true, 
            feedbacks 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// API to delete feedback (admin only)
const deleteFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;

        const feedback = await feedbackModel.findByIdAndDelete(feedbackId);
        
        if (!feedback) {
            return res.status(404).json({ 
                success: false, 
                message: "Feedback not found" 
            });
        }

        // Update doctor's average rating after deletion
        await updateDoctorRating(feedback.doctorId);

        res.status(200).json({ 
            success: true, 
            message: "Feedback deleted successfully" 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export {
    submitFeedback,
    getDoctorFeedbacks,
    getAllFeedbacks,
    getUserFeedbacks,
    deleteFeedback
};