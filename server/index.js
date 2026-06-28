require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // Dynamically allow the requesting origin to assist deployment transitions
        // and support Vercel preview environments, preserving cookies/credentials.
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length) {
        const bodyCopy = { ...req.body };
        if (bodyCopy.password) bodyCopy.password = '***';
        if (bodyCopy.accessToken) bodyCopy.accessToken = '***';
        console.log('Body:', bodyCopy);
    }
    next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const tripController = require('./controllers/tripController');

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Public route — no auth needed (shared trips)
app.get('/api/public/trips/:shareId', tripController.getPublicTrip);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running perfectly!' });
});

// Basic Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });
