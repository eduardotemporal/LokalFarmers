import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Import User model if you need to fetch the user object

const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    // Optionally check for token in cookies as well
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
        return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request object
        // We store the id and role in the token payload (see routes/auth.js generateToken)
        // You could also fetch the full user object from DB if needed:
        // req.user = await User.findById(decoded.user.id).select('-password');
        // if (!req.user) {
        //     return res.status(401).json({ success: false, message: 'User not found' });
        // }

        // For now, just attach the decoded payload which contains id and role
        req.user = decoded.user;

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Token verification error:', err.message);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
        if (err.name === 'TokenExpiredError') {
             return res.status(401).json({ success: false, message: 'Not authorized, token expired' });
        }
        // Handle other potential errors
        return res.status(500).json({ success: false, message: 'Server error during token verification' });
    }
};

export default protect;
