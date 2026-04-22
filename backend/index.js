const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const mentorRoutes = require('./src/routes/mentorRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const calendarRoutes = require('./src/routes/calendarRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const app = express();

app.use(cors({
    origin: 'https://mentor-web-2.onrender.com', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use('/api/mentors', mentorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
// Gắn route
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/profile', profileRoutes);
app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => {
    res.send('Mentor Platform API đang chạy ngon lành!');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server Backend is running on port ${PORT}`);
});