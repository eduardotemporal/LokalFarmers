import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import protect from '../middleware/auth.js'; // Adjust path if necessary
import { authorize } from '../middleware/roleAuth.js'; // Adjust path if necessary
import { check, validationResult } from 'express-validator';

const router = express.Router();

// --- Apply admin protection to all routes in this file ---
// Any request hitting a route defined below this line must first pass 'protect' and then 'authorize('Admin')'.
router.use(protect, authorize('Admin'));

// --- Placeholder for routes to be added below ---
router.get('/', (req, res) => {
    res.send('Admin Route Base - Requires Admin Role');
});


// --- Order Management Routes ---

// @route   GET /api/admin/orders
// @desc    Get all orders with pagination
// @access  Private (Admin only)
router.get('/orders', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const ordersPromise = Order.find()
                                  .populate('consumer', 'name email') // Populate consumer details
                                  .populate('products.product', 'name') // Populate product names within items
                                  .skip(skip)
                                  .limit(limit)
                                  .sort({ createdAt: -1 });

        const totalOrdersPromise = Order.countDocuments();

        const [orders, totalOrders] = await Promise.all([ordersPromise, totalOrdersPromise]);

        const totalPages = Math.ceil(totalOrders / limit);

        res.json({
            orders,
            page,
            limit,
            totalPages,
            totalOrders,
        });
    } catch (err) {
        console.error('Admin Get Orders Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/orders/:orderId
// @desc    Get order by ID
// @access  Private (Admin only)
router.get('/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
                                .populate('consumer', 'name email')
                                .populate('products.product', 'name price'); // Include price maybe

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        console.error('Admin Get Order By ID Error:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found (invalid ID format)' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/orders/:orderId/status
// @desc    Update order status
// @access  Private (Admin only)
router.put(
    '/orders/:orderId/status',
    [ // Input validation
      // Ensure status is one of the allowed values from the Order model enum
      check('status', 'Status is required and must be one of the allowed values')
          .isIn(['Pending', 'Accepted', 'Shipped', 'Delivered', 'Cancelled'])
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const order = await Order.findByIdAndUpdate(
                req.params.orderId,
                { status: req.body.status },
                { new: true, runValidators: true } // Return updated doc, run schema validation
            ).populate('consumer', 'name email').populate('products.product', 'name'); // Repopulate relevant fields

            if (!order) {
                return res.status(404).json({ msg: 'Order not found' });
            }
            res.json(order);
        } catch (err) {
            console.error('Admin Update Order Status Error:', err.message);
             if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Order not found (invalid ID format)' });
            }
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE /api/admin/orders/:orderId
// @desc    Delete an order
// @access  Private (Admin only)
router.delete('/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.orderId);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Note: Deleting orders might be undesirable for record-keeping.
        // Consider a 'Cancelled' status or soft delete instead.

        res.json({ msg: 'Order deleted successfully' });
    } catch (err) {
        console.error('Admin Delete Order Error:', err.message);
         if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found (invalid ID format)' });
        }
        res.status(500).send('Server Error');
    }
});


// --- Product Management Routes ---

// @route   GET /api/admin/products
// @desc    Get all products with pagination
// @access  Private (Admin only)
router.get('/products', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const productsPromise = Product.find()
                                      .populate('farmer', 'name email') // Populate farmer details
                                      .skip(skip)
                                      .limit(limit)
                                      .sort({ createdAt: -1 });

        const totalProductsPromise = Product.countDocuments();

        const [products, totalProducts] = await Promise.all([productsPromise, totalProductsPromise]);

        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            products,
            page,
            limit,
            totalPages,
            totalProducts,
        });
    } catch (err) {
        console.error('Admin Get Products Error:', err.message);
        res.status(500).send('Server Error');
    }
});


// @route   DELETE /api/admin/products/:productId
// @desc    Delete a product
// @access  Private (Admin only)
router.delete('/products/:productId', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.productId);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Optional: Consider implications - deleting a product might affect past orders.
        // Soft delete might be better in a real application.

        res.json({ msg: 'Product deleted successfully' });
    } catch (err) {
        console.error('Admin Delete Product Error:', err.message);
         if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found (invalid ID format)' });
        }
        res.status(500).send('Server Error');
    }
});


// --- User Management Routes ---

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const usersPromise = User.find()
                                .select('-password') // Exclude password
                                .skip(skip)
                                .limit(limit)
                                .sort({ createdAt: -1 }); // Sort by newest first

        const totalUsersPromise = User.countDocuments();

        const [users, totalUsers] = await Promise.all([usersPromise, totalUsersPromise]);

        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            users,
            page,
            limit,
            totalPages,
            totalUsers,
        });
    } catch (err) {
        console.error('Admin Get Users Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/users/:userId
// @desc    Get user by ID
// @access  Private (Admin only)
router.get('/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Admin Get User By ID Error:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found (invalid ID format)' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/users/:userId/role
// @desc    Update user role
// @access  Private (Admin only)
router.put(
    '/users/:userId/role',
    [ // Input validation
        check('role', 'Role is required and must be Admin, Farmer, or Consumer')
            .isIn(['Admin', 'Farmer', 'Consumer'])
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findByIdAndUpdate(
                req.params.userId,
                { role: req.body.role },
                { new: true, runValidators: true } // Return updated doc, run schema validation
            ).select('-password');

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }
            res.json(user);
        } catch (err) {
            console.error('Admin Update User Role Error:', err.message);
             if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'User not found (invalid ID format)' });
            }
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:userId', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Optional: Consider deleting related data (products, orders) or handling it via schema design/hooks.
        // For now, just delete the user document.

        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error('Admin Delete User Error:', err.message);
         if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found (invalid ID format)' });
        }
        res.status(500).send('Server Error');
    }
});


// Export the router
export default router;
