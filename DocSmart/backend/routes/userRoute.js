import express from 'express';
import { loginUser, registerUser, getProfile, updateProfile,  bookAppointment, getAppointmentById,editappointment, deleteAppointment, checkAppointmentSlot,listAppointment,cancelAppointment, paymentRazorpay, verifyRazorpay, paymentStripe, verifyStripe } from '../controllers/userController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)

userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)
userRouter.post("/payment-stripe", authUser, paymentStripe)
userRouter.post("/verifyStripe", authUser, verifyStripe)

userRouter.put('/edit-appointment/:appointmentId',authUser, editappointment)
userRouter.get('/my-appointment/:appointmentId', authUser, getAppointmentById);
userRouter.delete('/delete-appointment/:appointmentId', authUser, (req, res) => {
    const { appointmentId } = req.params;
    deleteAppointment(appointmentId, res);  // Pass res as argument
});
userRouter.post('/check-appointment-slot', authUser,checkAppointmentSlot);



export default userRouter;