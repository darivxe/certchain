const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const certificateRoutes = require('./routes/certificateroutes');
const cors = require('cors');
const path = require('path'); // Import path to serve static files
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests

// Serve static files (CSS, JS, etc.) from 'frontend' folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Routes for your HTML files
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'profile.html'));
});

app.get('/uni', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'uni.html'));
});

app.get('/verify', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'verify.html'));
});

// Add this new route to serve the upload HTML page
app.get('/upload-certificates', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'upload.html'), (err) => {
        if (err) {
            res.status(err.status).end();
        }
    });
});

// Define the User model
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

const User = mongoose.model('User ', userSchema);

// Register a new user
app.post('/api/users/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword });
        res.json({ success: true, message: 'Registration successful!' });
    } catch (error) {
        res.json({ success: false, message: 'Registration failed. Please try again.' });
    }
});

// Login a user
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.json({ success: false, message: 'Invalid email or password' });
        } else {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                res.json({ success: false, message: 'Invalid email or password' });
            } else {
                const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
                res.json({ success: true, message: 'Login successful!', token, userId: user._id });
            }
        }
    } catch (error) {
        res.json({ success: false, message: 'Error logging in' });
    }
});

// Get user profile
app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            res.json({ success: false, message: 'User  not found' });
        } else {
            res.json({ success: true, user: { email: user.email } });
        }
    } catch (error) {
        res.json({ success: false, message: 'Error getting user profile' });
    }
});

// API Routes
app.use('/api/users', userRoutes); // User routes
app.use('/api/certificates', certificateRoutes); // Certificate routes

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to Certchain!');
});

// Connect to MongoDB
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

// Start the server
const startServer = async () => {
    await connectToDatabase();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();