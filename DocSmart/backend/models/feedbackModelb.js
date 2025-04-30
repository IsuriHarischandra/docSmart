import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userDetails: {
        name: { type: String, required: true },
        image: { type: String }
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    doctorDetails: {
        name: { type: String, required: true },
        image: { type: String }
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 500
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;