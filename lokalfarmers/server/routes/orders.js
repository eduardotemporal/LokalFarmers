import express from 'express';
import { check, validationResult } from 'express-validator';
import mongoose from 'mongoose'; // Needed for transaction (if implemented) and ObjectId validation

import Order from '../models/Order.js';
import Product from '../models/Product.js'; // Need Product model for stock check/update
import protect from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = express.Router();

// --- Validation Rules ---
const orderValidationRules = [
  check('products', 'Products array is required and cannot be empty').isArray({ min: 1 }),
  check('products.*.product', 'Each product must have a valid product ID').isMongoId(),
  check('products.*.quantity', 'Each product must have a quantity greater than 0').isInt({ min: 1 }),
  // Optional: Validate shippingAddress if required by your logic
  // check('shippingAddress.street', 'Street is required').if(check('shippingAddress').exists()).notEmpty(),
  // check('shippingAddress.city', 'City is required').if(check('shippingAddress').exists()).notEmpty(),
  // check('shippingAddress.postalCode', 'Postal code is required').if(check('shippingAddress').exists()).notEmpty(),
  // check('shippingAddress.country', 'Country is required').if(check('shippingAddress').exists()).notEmpty(),
];

// --- Error Handling Middleware for Validation ---
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// --- Routes ---

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (Consumer only)
router.post(
  '/',
  protect,
  authorize('Consumer'),
  orderValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { products: incomingProducts, shippingAddress } = req.body;
    const consumerId = req.user.id;

    // --- NOTE on Transactions ---
    // The following operations (stock check, order creation, stock decrement)
    // should ideally be performed within a MongoDB transaction to ensure atomicity.
    // This requires a replica set configuration. Without transactions, there's a
    // small risk of inconsistency (e.g., order created but stock not decremented).
    // We proceed without transactions for simplicity, acknowledging the limitation.

    try {
      let totalAmount = 0;
      const orderProducts = [];
      const productUpdates = []; // To store stock decrement operations

      // 1. Fetch Product Details & Stock Check
      for (const item of incomingProducts) {
        const product = await Product.findById(item.product);

        if (!product) {
          return res.status(404).json({ errors: [{ msg: `Product not found: ${item.product}` }] });
        }

        if (product.quantity < item.quantity) {
          return res.status(400).json({ errors: [{ msg: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` }] });
        }

        // Add validated item to orderProducts array
        orderProducts.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price, // Use current price from DB
        });

        // Accumulate total amount
        totalAmount += product.price * item.quantity;

        // Prepare stock update operation
        productUpdates.push({
            updateOne: {
                filter: { _id: product._id },
                update: { $inc: { quantity: -item.quantity } }
            }
        });
      }

      // 2. Create Order Document
      const newOrder = new Order({
        consumer: consumerId,
        products: orderProducts,
        totalAmount,
        shippingAddress: shippingAddress || {}, // Use provided or default to empty object
        status: 'Pending',
      });

      // 3. Save the Order
      const savedOrder = await newOrder.save();

      // 4. Decrement Stock (Attempt after order save)
      try {
        if (productUpdates.length > 0) {
            await Product.bulkWrite(productUpdates);
        }
      } catch (stockUpdateError) {
          console.error('Stock update failed after order creation:', stockUpdateError);
          // --- Inconsistency Handling (Difficult without transactions) ---
          // Options:
          // a) Log the error for manual correction.
          // b) Attempt to cancel the order (set status to 'Cancelled', potentially try to refund).
          // c) Leave as is (order exists, stock not updated).
          // For now, we log the error and proceed, returning the saved order.
          // Consider adding a 'FailedStockUpdate' status or flag to the order.
      }

      // 5. Respond with the created order
      res.status(201).json(savedOrder);

    } catch (err) {
      console.error('Order Creation Error:', err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/orders/myorders
// @desc    Get orders placed by the logged-in consumer
// @access  Private (Consumer only)
router.get('/myorders', protect, authorize('Consumer'), async (req, res) => {
  try {
    const orders = await Order.find({ consumer: req.user.id })
      .populate('products.product', 'name images category') // Populate product details
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(orders);
  } catch (err) {
    console.error('Get Consumer Orders Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/orders/farmerorders
// @desc    Get orders containing products sold by the logged-in farmer
// @access  Private (Farmer only)
router.get('/farmerorders', protect, authorize('Farmer'), async (req, res) => {
  try {
    // --- Inefficient Approach (Iterate all orders) ---
    // Find all orders, then filter in application code. Very inefficient for many orders.
    // const allOrders = await Order.find().populate('products.product', 'farmer name');
    // const farmerOrders = allOrders.filter(order =>
    //     order.products.some(item => item.product?.farmer?.toString() === req.user.id)
    // );

    // --- More Efficient Approach (Requires farmer ID on order item or different schema) ---
    // If farmer ID was on orderItemSchema:
    // const farmerOrders = await Order.find({ 'products.farmer': req.user.id })
    //                                  .populate(...)
    //                                  .sort(...);

    // --- Workaround: Find farmer's products first, then find orders containing those products ---
    const farmerProducts = await Product.find({ farmer: req.user.id }).select('_id'); // Get only IDs
    const farmerProductIds = farmerProducts.map(p => p._id);

    if (farmerProductIds.length === 0) {
        return res.json([]); // Farmer has no products, so no orders
    }

    // Find orders where the 'products.product' array contains AT LEAST ONE product ID from the farmer's list
    const orders = await Order.find({ 'products.product': { $in: farmerProductIds } })
                              .populate('consumer', 'name email') // Populate consumer details
                              .populate('products.product', 'name') // Populate product name
                              .sort({ createdAt: -1 });

    // Optional: Filter the products array within each order to only show items by this farmer
    // (This adds processing time but might be desired)
    // const filteredOrders = orders.map(order => {
    //     order.products = order.products.filter(item => farmerProductIds.some(fpId => fpId.equals(item.product._id)));
    //     return order;
    // });


    // For now, return the full orders containing any of the farmer's products
    res.json(orders);

  } catch (err) {
    console.error('Get Farmer Orders Error:', err.message);
    res.status(500).send('Server Error');
  }
});


export default router;
