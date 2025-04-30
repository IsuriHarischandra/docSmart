import { useState, useEffect } from 'react';
import { request } from 'umi';
import { Card, Button, Input, Rate, message } from 'antd';

const Feedback = ({ userId, doctorId, isAdmin }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      let url = '/api/feedback/all';
      if (userId) url = `/api/feedback/user/${userId}`;
      if (doctorId) url = `/api/feedback/doctor/${doctorId}`;

      const response = await request(url);
      if (response.success) {
        setFeedbacks(response.feedbacks);
      }
    } catch (error) {
      message.error('Failed to fetch feedbacks');
    }
  };

  const submitFeedback = async () => {
    if (!rating) {
      return message.error('Please provide a rating');
    }
    setLoading(true);
    try {
      const response = await request('/api/feedback/submit', {
        method: 'POST',
        data: { userId, doctorId, rating, comment },
      });
      if (response.success) {
        message.success('Feedback submitted');
        fetchFeedbacks();
        setRating(0);
        setComment('');
      }
    } catch (error) {
      message.error('Error submitting feedback');
    }
    setLoading(false);
  };

  const deleteFeedback = async (feedbackId) => {
    try {
      await request(`/api/feedback/${feedbackId}`, { method: 'DELETE' });
      message.success('Feedback deleted');
      fetchFeedbacks();
    } catch (error) {
      message.error('Error deleting feedback');
    }
  };

  return (
    <div>
      <h2>Feedback</h2>
      <Card>
        <Rate value={rating} onChange={setRating} />
        <Input.TextArea
          rows={3}
          placeholder="Write a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button type="primary" loading={loading} onClick={submitFeedback}>
          Submit Feedback
        </Button>
      </Card>
      <h3>Previous Feedbacks</h3>
      {feedbacks.map((fb) => (
        <Card key={fb._id} style={{ marginTop: 10 }}>
          <p><strong>{fb.userDetails?.name}</strong> rated <Rate disabled value={fb.rating} /></p>
          <p>{fb.comment}</p>
          {isAdmin && (
            <Button danger onClick={() => deleteFeedback(fb._id)}>Delete</Button>
          )}
        </Card>
      ))}
    </div>
  );
};

export default Feedback;
