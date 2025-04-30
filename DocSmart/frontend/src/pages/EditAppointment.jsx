import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const EditAppointmentPage = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Convert "DD_MM_YYYY" to "DD MMM YYYY"
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])-1] + " " + dateArray[2]
}

  // Convert "HH:MM" (24-hour) to "hh:mm AM/PM"
  const convertTo12Hour = (time24hr) => {
    if (!time24hr) return '';
    const [hours, minutes] = time24hr.split(':');
    let period = 'AM';
    let formattedHours = parseInt(hours, 10);

    if (formattedHours >= 12) {
      period = 'PM';
      if (formattedHours > 12) {
        formattedHours -= 12;
      }
    }
    if (formattedHours === 0) {
      formattedHours = 12;
    }

    // Ensure minutes are always two digits
    const formattedMinutes = minutes.padStart(2, '0');

    return `${formattedHours}:${formattedMinutes} ${period}`;
  };

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/my-appointment/${appointmentId}`, {
          headers: { token },
        });

        setAppointment(data.appointment);
        setNewDate(data.appointment.slotDate);
        setNewTime(data.appointment.slotTime);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Failed to fetch appointment details.');
      }
    };

    fetchAppointment();
  }, [appointmentId, backendUrl, token]);

  const handleSave = async () => {
    if (!newDate || !newTime) {
      toast.error('Please provide both date and time.');
      return;
    }
  
    const currentDate = new Date();
    const selectedDate = new Date(newDate);
  
    // Check if the selected date is in the past
    if (selectedDate < currentDate) {
      toast.error('You cannot book an appointment for a past date.');
      return;
    }
  
    // If the selected date is today, ensure the selected time is in the future
    if (selectedDate.toDateString() === currentDate.toDateString()) {
      const [hours, minutes] = newTime.split(':');
      const selectedTime = new Date(currentDate.setHours(hours, minutes, 0, 0));
  
      if (selectedTime <= currentDate) {
        toast.error('You cannot book an appointment for a past time today.');
        return;
      }
    }
  
    try {
      const formattedDate = newDate.split('-').reverse().join('_'); // Convert "YYYY-MM-DD" → "DD_MM_YYYY"
      const formattedTime = newTime; // Keep 24-hour format for backend
  
      // Check if the time slot is available
      const response = await axios.post(`${backendUrl}/api/user/check-appointment-slot`, {
        slotDate: formattedDate,
        slotTime: formattedTime,
      }, { headers: { token } });
  
      console.log('Slot availability response:', response.data); // Log response for debugging
  
      if (!response.data.success) {
        toast.error('This time slot is already booked for this doctor.');
        return;
      }
  
      // Proceed with editing the appointment if the slot is available
      const editAppointment = { slotDate: formattedDate, slotTime: formattedTime };
      const { data } = await axios.put(`${backendUrl}/api/user/edit-appointment/${appointmentId}`, editAppointment, {
        headers: { token },
      });
  
      if (data.success) {
        toast.success(data.message);
        navigate('/my-appointments');
      } else {
        toast.error(data.message); // Handle backend validation error here
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to save changes.');
    }
  };
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px auto', maxWidth: '500px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      {appointment ? (
        <>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>Edit Appointment</h2>
          <div>
            <p style={{ fontSize: '16px', margin: '10px 0', color: '#555' }}><strong style={{ fontWeight: 'bold', color: '#333' }}>Doctor: </strong>{appointment.docData.name}</p>
            <p style={{ fontSize: '16px', margin: '10px 0', color: '#555' }}><strong style={{ fontWeight: 'bold', color: '#333' }}>Speciality: </strong>{appointment.docData.speciality}</p>
            <p style={{ fontSize: '16px', margin: '10px 0', color: '#555' }}><strong style={{ fontWeight: 'bold', color: '#333' }}>Address: </strong>{appointment.docData.address.line1}, {appointment.docData.address.line2}</p>
            <p style={{ fontSize: '16px', margin: '10px 0', color: '#555' }}>
              <strong style={{ fontWeight: 'bold', color: '#333' }}>Current Date & Time: </strong>
              {slotDateFormat(appointment.slotDate)} | {convertTo12Hour(appointment.slotTime)}
            </p>

            <input
              type="date"
              value={newDate} // Convert "DD_MM_YYYY" → "YYYY-MM-DD"
              onChange={(e) => setNewDate(e.target.value)}
              style={{ width: '100%', padding: '10px', margin: '10px 0 20px 0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px', color: '#333', backgroundColor: '#fff' }}
            />

            <input
              type="time"
              value={newTime} // Use raw 24-hour format
              onChange={(e) => setNewTime(e.target.value)}
              style={{ width: '100%', padding: '10px', margin: '10px 0 20px 0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px', color: '#333', backgroundColor: '#fff' }}
            />

            <div style={{ marginTop: '20px' }}>
              <button onClick={handleSave} style={{ padding: '12px 24px', backgroundColor: '#090949', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', width: '100%', transition: 'background-color 0.3s ease' }}>
                Save Changes
              </button>
            </div>
          </div>
        </>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#777' }}>Loading appointment details...</p>
      )}
    </div>
  );
};

export default EditAppointmentPage;
