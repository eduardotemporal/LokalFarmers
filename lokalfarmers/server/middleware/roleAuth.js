const authorize = (...roles) => {
    return (req, res, next) => {
        // Assumes the 'protect' middleware has already run and attached req.user
        if (!req.user || !req.user.role) {
            // This case should technically be caught by 'protect' middleware first
            // if the token is missing or invalid, but added for robustness.
            return res.status(401).json({ success: false, message: 'Not authorized, user data missing' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next(); // Role is authorized, proceed to the next middleware/route handler
    };
};

export { authorize }; // Use named export for clarity when importing multiple functions potentially
