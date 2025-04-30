import Feedback from '../models/FeedbackSchema.js';

// Create a new feedback
const createFeedback = async (req, res) => {
  const { name, email, serviceQuality, value, experience, rating, sharePublicly } = req.body;

  try {
    const newFeedback = new Feedback({
      name,
      email,
      serviceQuality,
      value,
      experience,
      rating,
      sharePublicly
    });

    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (err) {
    res.status(500).json({ message: 'Error creating feedback', error: err.message });
  }
};

// Get all feedbacks
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving feedbacks', error: err.message });
  }
};

// Get feedback by ID
const getFeedbackById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving feedback', error: err.message });
  }
};

// Update feedback
const updateFeedback = async (req, res) => {
  const { id } = req.params;
  const { name, email, serviceQuality, value, experience, rating, sharePublicly } = req.body;

  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(id, {
      name,
      email,
      serviceQuality,
      value,
      experience,
      rating,
      sharePublicly
    }, { new: true });

    if (!updatedFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json(updatedFeedback);
  } catch (err) {
    res.status(500).json({ message: 'Error updating feedback', error: err.message });
  }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(id);
    if (!deletedFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting feedback', error: err.message });
  }
};

export {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback
};
