const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Built-in middleware to parse JSON bodies

// Test Route
app.get('/test', (req, res) => {
    console.log('GET /test called');
    res.send('Welcome to Finsure');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
});

const User = mongoose.model('User', UserSchema);

// Routes

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Login request received:', req.body);

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if password matches
        if (user.password !== password) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Login successful for user:', username);
        res.json({ message: 'Login successful!', user: { username: user.username, email: user.email } });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Registration Route
app.post('/register', async (req, res) => {
    console.log('POST /register called');
    console.log('Request body:', req.body);

    const { username, password, firstName, lastName, email, dateOfBirth } = req.body;

    try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if user or email already exists
        const existingUser = await User.findOne({ username });
        const existingEmail = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', username);
            return res.status(400).json({ error: 'Username already exists' });
        }
        if (existingEmail) {
            console.log('Email already exists:', email);
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create new user
        const newUser = new User({ username, password, firstName, lastName, email, dateOfBirth });
        const savedUser = await newUser.save();

        console.log('New user registered:', savedUser.username);
        res.status(201).json({ message: 'User registered successfully!', user: { username: savedUser.username, email: savedUser.email } });
    } catch (err) {
        console.error('Error during registration:', err);

        // Handle duplicate key errors specifically
        if (err.code === 11000) {
            res.status(400).json({ error: 'Duplicate key error: Username or Email already exists.' });
        } else {
            res.status(500).json({ error: 'Something went wrong' });
        }
    }
});

// Profile Route
app.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        console.log('Fetching profile for userId:', userId);

        const user = await User.findById(userId).select('-password'); // Exclude password from response
        if (!user) {
            console.log('User not found for userId:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('Profile fetched for userId:', userId);
        res.json(user);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
