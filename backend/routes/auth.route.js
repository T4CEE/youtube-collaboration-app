const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET


router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
          }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }

        const user = new User({ name, email, password });
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        
        if (user) {
            token(user._id, res)
            await user.save();
            res.status(201).json({
                id: user._id,
                email: user.email,
            })

        } else {
            return res.status(400).json({ error: "Failed to create user" });
        }

        // res.status(201).json({ token, user }, console.log("sign up succesful"));

    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isUser = await bcrypt.compare(password, user.password);
        if (!isUser) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ 
            id: user._id,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

router.get('/verify', (req, res) => {
    const token = req.headers['x-auth-token'];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ id: decoded.id });
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
});

module.exports = router;
