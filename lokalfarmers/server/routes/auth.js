import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js'; // Assuming ES Module syntax based on previous steps

const router = express.Router();

// --- Rate Limiting ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// --- Helper Function to Generate JWT ---
const generateToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            role: user.role,
        },
    };

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
        // In a real app, might want to throw or handle more gracefully
        // For now, we log and potentially let the server crash or endpoint fail
        throw new Error('Server configuration error: JWT_SECRET missing.');
    }
     // Ensure JWT_EXPIRES_IN is defined
    if (!process.env.JWT_EXPIRES_IN) {
        console.error('FATAL ERROR: JWT_EXPIRES_IN is not defined.');
        throw new Error('Server configuration error: JWT_EXPIRES_IN missing.');
    }


    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d', // Use env variable or default
    });
};

// --- Registration Route ---
router.post(
    '/register',
    authLimiter, // Apply rate limiting
    [
        // Validation middleware
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
        // Optional: Add role validation if you allow specifying role during registration
        // check('role', 'Invalid role specified').optional().isIn(['Farmer', 'Consumer'])
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role } = req.body; // Include role if applicable

        try {
            // 1. Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            // 2. Create new user instance
            // Role will be set to 'Consumer' by default if not provided and validated
            user = new User({
                name,
                email,
                password, // Password will be hashed by the pre-save hook
                role: role || 'Consumer' // Assign role if provided, else default
            });

            // 3. Save user to database (triggers pre-save hook)
            await user.save();

            // 4. Respond (Option 1: Just success message)
            res.status(201).json({ msg: 'User registered successfully' });

            // Option 2: Generate token and log user in immediately (less common for registration)
            // const token = generateToken(user);
            // res.status(201).json({ token });

        } catch (err) {
            console.error('Registration Error:', err.message);
            res.status(500).send('Server error');
        }
    }
);

// --- Login Route ---
router.post(
    '/login',
    authLimiter, // Apply rate limiting
    [
        // Validation middleware
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // 1. Find user by email (include password field for comparison)
            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // 2. Compare passwords
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // 3. Passwords match - Generate JWT
            const token = generateToken(user);

            // 4. Send token to client
            res.json({ token });

        } catch (err) {
            console.error('Login Error:', err.message);
            res.status(500).send('Server error');
        }
    }
);

export default router;
