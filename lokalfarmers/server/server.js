import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import authRoutes from './routes/auth.js'; // Import the auth routes
import productRoutes from './routes/products.js'; // Import the product routes
import orderRoutes from './routes/orders.js'; // Import the order routes
import adminRoutes from './routes/admin.js'; // Import the admin routes

// Load environment variables
dotenv.config();

const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Database connection
if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1); // Exit if the essential config is missing
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1); // Exit on connection failure
    });

// Middleware
app.use(cors()); // Enable CORS for all origins (consider restricting in production)
app.use(express.json()); // Parse JSON request bodies
app.use(mongoSanitize()); // Sanitize data against NoSQL injection attacks

// --- Mount Routes ---
app.use('/api/auth', authRoutes); // Mount the authentication routes
app.use('/api/products', productRoutes); // Mount the product routes
app.use('/api/orders', orderRoutes); // Mount the order routes
app.use('/api/admin', adminRoutes); // Mount the admin routes

// Basic Route for Testing
app.get('/', (req, res) => {
    res.send('LokalFarmers API Running');
});

// Basic Error Handling Middleware (Example)
// Note: More sophisticated error handling should be implemented
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
