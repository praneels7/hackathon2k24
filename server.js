const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/test', (req, res) => {
    console.log('GET /test called');
    res.send('Welcome to Finsure');
});


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date }
});

const User = mongoose.model('User', UserSchema);


const BankUserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accountType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const BankUser = mongoose.model('BankUser', BankUserSchema);


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Login request received:', req.body);

      
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

    
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


app.post('/submit_registration', async (req, res) => {
    const { firstName, lastName, email, password, accountType } = req.body;

    try {
        console.log('Account registration request received:', req.body);

        if (!firstName || !lastName || !email || !password || !accountType) {
            console.log('Missing required fields:', req.body);
            return res.status(400).json({ error: 'All fields are required' });
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format:', email);
            return res.status(400).json({ error: 'Invalid email format' });
        }

        
        const existingEmail = await BankUser.findOne({ email });
        if (existingEmail) {
            console.log('Email already exists:', email);
            return res.status(400).json({ error: 'Email already exists' });
        }

     
        const validAccountTypes = [
            'basic_checking', 'premium_checking', 'business_checking',
            'basic_savings', 'premium_savings', 'business_savings',
            'credit_card', 'roth_ira', 'traditional_ira', '401k'
        ];
        if (!validAccountTypes.includes(accountType)) {
            console.log('Invalid account type:', accountType);
            return res.status(400).json({ error: 'Invalid account type' });
        }

       
        const newBankUser = new BankUser({ firstName, lastName, email, password, accountType });
        const savedBankUser = await newBankUser.save();

        console.log('New bank user created:', savedBankUser.email);
        res.status(201).json({ message: 'Account created successfully!', account: savedBankUser });
    } catch (err) {
        console.error('Error during account creation:', err);

        
        if (err.code === 11000) {
            res.status(400).json({ error: 'Duplicate key error: Email already exists.' });
        } else {
            res.status(500).json({ error: 'Something went wrong' });
        }
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
