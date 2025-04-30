import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  serviceQuality: { type: String, required: true },
  value: { type: String, required: true },
  experience: { type: String, required: true },
  rating: { type: Number, required: true },
  sharePublicly: { type: Boolean, required: true },
}, {
  timestamps: true
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
