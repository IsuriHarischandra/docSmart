import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, Box, Rating, Grid, Card, CardContent, IconButton, Divider } from '@mui/material';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    serviceQuality: '',
    value: '',
    experience: '', 
    rating: 0,
    sharePublicly: false,
  });
  const [feedbacks, setFeedbacks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Rating change
  const handleRating = (event, newValue) => {
    setFormData({ ...formData, rating: newValue });
  };

  // Fetch feedbacks from the backend
  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/feedbacks/get');
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedbacks', error);
    }
  };

  // Handle form submit to send data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await axios.put(`http://localhost:4000/api/feedbacks/update/${currentId}`, formData);
        setEditMode(false);
        setCurrentId(null);
      } else {
        await axios.post('http://localhost:4000/api/feedbacks/create', formData);
      }
      fetchFeedbacks(); // Refresh the feedback list after submission
      setFormData({
        name: '',
        email: '',
        serviceQuality: '',
        value: '',
        experience: '',
        rating: 0,
        sharePublicly: false,
      });
    } catch (error) {
      console.error('Error submitting feedback', error);
    }
  };

  // Edit a feedback
  const handleEdit = (id) => {
    const feedback = feedbacks.find((f) => f._id === id);
    setFormData(feedback);
    setEditMode(true);
    setCurrentId(id);
  };

  // Delete a feedback
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/feedbacks/delete/${id}`);
      fetchFeedbacks(); // Refresh the feedback list after deletion
    } catch (error) {
      console.error('Error deleting feedback', error);
    }
  };

  // Use useEffect to fetch feedbacks when the component mounts
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4, bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {editMode ? 'Edit Feedback' : 'Submit Feedback'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          variant="outlined"
          margin="normal"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          variant="outlined"
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Overall Satisfaction
        </Typography>
        <FormControl fullWidth margin="normal">
          <TextField
            select
            label="Overall Service Quality"
            name="serviceQuality"
            value={formData.serviceQuality}
            onChange={handleChange}
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="Very Satisfied">Very Satisfied</MenuItem>
            <MenuItem value="Satisfied">Satisfied</MenuItem>
            <MenuItem value="Not Satisfied">Not Satisfied</MenuItem>
          </TextField>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <TextField
            select
            label="Value"
            name="value"
            value={formData.value}
            onChange={handleChange}
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="Very Satisfied">Very Satisfied</MenuItem>
            <MenuItem value="Satisfied">Satisfied</MenuItem>
            <MenuItem value="Not Satisfied">Not Satisfied</MenuItem>
          </TextField>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <TextField
            select
            label="Overall Experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
          >
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="Very Satisfied">Very Satisfied</MenuItem>
            <MenuItem value="Satisfied">Satisfied</MenuItem>
            <MenuItem value="Not Satisfied">Not Satisfied</MenuItem>
          </TextField>
        </FormControl>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Rate Us</Typography>
          <Rating
            name="rating"
            value={formData.rating}
            onChange={handleRating}
            precision={1}
            size="large"
          />
        </Box>
        <FormControl component="fieldset" sx={{ mt: 3 }}>
          <FormLabel component="legend">Would you like to share this publicly?</FormLabel>
          <RadioGroup
            row
            name="sharePublicly"
            value={formData.sharePublicly}
            onChange={handleChange}
          >
            <FormControlLabel value={true} control={<Radio />} label="Yes" />
            <FormControlLabel value={false} control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
        <Button
  type="submit"
  variant="contained"
  size="large"
  sx={{ 
    mt: 4, 
    display: 'block', 
    mx: 'auto',
    bgcolor: '#1F2B5B', // Using bgcolor shorthand
    '&:hover': {
      bgcolor: '#1A2451',
    }
  }}
>
  {editMode ? 'Update Feedback' : 'Submit Feedback'}
</Button>
      </form>

      {/* Display all feedbacks */}
      <Typography variant="h5" sx={{ mt: 5 }} gutterBottom>
        Feedbacks List
      </Typography>
      <Grid container spacing={3}>
        {feedbacks.map((feedback) => (
          <Grid item xs={12} sm={6} md={4} key={feedback._id}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
              <CardContent sx={{ padding: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {feedback.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Email: <strong>{feedback.email}</strong>
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Service Quality:</strong> {feedback.serviceQuality}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Value:</strong> {feedback.value}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Experience:</strong> {feedback.experience}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Rating:</strong> {feedback.rating} / 5
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Share Publicly:</strong> {feedback.sharePublicly ? 'Yes' : 'No'}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton onClick={() => handleEdit(feedback._id)} color="primary" sx={{ mx: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(feedback._id)} color="error" sx={{ mx: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Feedback;
