const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide name, email, and password.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, passwordHash });

        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { _id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: { _id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
};
