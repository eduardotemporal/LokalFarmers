import express from 'express';
import { check, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import protect from '../middleware/auth.js'; // Auth middleware
import { authorize } from '../middleware/roleAuth.js'; // Role middleware

const router = express.Router();

// --- Validation Rules ---
const productValidationRules = [
  check('name', 'Product name is required').not().isEmpty().trim(),
  check('description', 'Product description is required').not().isEmpty(),
  check('category', 'Product category is required').not().isEmpty().trim(),
  check('price', 'Price must be a non-negative number').isFloat({ min: 0 }),
  check('quantity', 'Quantity must be a non-negative integer').isInt({ min: 0 }),
  // Optional: Add validation for images if needed (e.g., check if it's an array of strings)
  // check('images.*', 'Images must be strings').optional().isString()
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

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Farmer only)
router.post(
  '/',
  protect,                // 1. User must be logged in
  authorize('Farmer'),    // 2. User must have 'Farmer' role
  productValidationRules, // 3. Validate input fields
  handleValidationErrors, // 4. Handle validation errors
  async (req, res) => {
    const { name, description, category, price, quantity, images } = req.body;

    try {
      const newProduct = new Product({
        name,
        description,
        category,
        price,
        quantity,
        images: images || [], // Default to empty array if not provided
        farmer: req.user.id, // Get farmer ID from the authenticated user (set by 'protect' middleware)
      });

      const product = await newProduct.save();
      res.status(201).json(product);
    } catch (err) {
      console.error('Product Creation Error:', err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/products/myproducts
// @desc    Get all products listed by the logged-in farmer
// @access  Private (Farmer only)
router.get('/myproducts', protect, authorize('Farmer'), async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id }).sort({ createdAt: -1 }); // Sort by newest first
    res.json(products);
  } catch (err) {
    console.error('Get Farmer Products Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/products/:productId
// @desc    Update a product owned by the farmer
// @access  Private (Farmer only)
router.put(
  '/:productId',
  protect,
  authorize('Farmer'),
  productValidationRules,
  handleValidationErrors,
  async (req, res) => {
    const { name, description, category, price, quantity, images } = req.body;
    const productId = req.params.productId;
    const farmerId = req.user.id;

    try {
      let product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      // Authorization check: Ensure the product belongs to the logged-in farmer
      if (product.farmer.toString() !== farmerId) {
        return res.status(403).json({ msg: 'User not authorized to update this product' });
      }

      // Build updated product object
      const updatedFields = { name, description, category, price, quantity, images };

      // Update the product
      product = await Product.findByIdAndUpdate(
          productId,
          { $set: updatedFields },
          { new: true, runValidators: true } // Return the updated doc & run schema validators
      );

      res.json(product);
    } catch (err) {
      console.error('Product Update Error:', err.message);
      // Handle potential CastError for invalid ObjectId
      if (err.kind === 'ObjectId') {
          return res.status(404).json({ msg: 'Product not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /api/products/:productId
// @desc    Delete a product owned by the farmer
// @access  Private (Farmer only)
router.delete('/:productId', protect, authorize('Farmer'), async (req, res) => {
  const productId = req.params.productId;
  const farmerId = req.user.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Authorization check: Ensure the product belongs to the logged-in farmer
    if (product.farmer.toString() !== farmerId) {
      return res.status(403).json({ msg: 'User not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(productId);

    res.json({ msg: 'Product removed successfully' });
    // Or use status 204 (No Content) if preferred: res.status(204).send();

  } catch (err) {
    console.error('Product Deletion Error:', err.message);
     // Handle potential CastError for invalid ObjectId
     if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

// --- Public Routes ---

// @route   GET /api/products/:productId
// @desc    Get a single product by ID (for public view)
// @access  Public
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
                                 .populate('farmer', 'name email'); // Populate farmer's name and email

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Get Single Product Error:', err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Product not found (invalid ID format)' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/products
// @desc    Get all products with filtering, searching, and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    // --- Query Parameters ---
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default 10 items per page
    const category = req.query.category;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const search = req.query.search; // Search term

    // --- Build Filter Object ---
    const filter = {};

    if (category) {
      // Case-insensitive category filter
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== null) {
        filter.price.$lte = maxPrice;
      }
    }

    if (search) {
      filter.$text = { $search: search };
      // Note: Text search requires a text index on the model (already added)
    }

    // --- Pagination ---
    const skip = (page - 1) * limit;

    // --- Execute Queries ---
    // Query for products matching filters and pagination
    const productsQuery = Product.find(filter)
      .populate('farmer', 'name') // Populate only farmer's name for list view
      .sort({ createdAt: -1 })   // Default sort by newest
      .skip(skip)
      .limit(limit);

    // Query for total count matching filters (for pagination calculation)
    const totalProductsQuery = Product.countDocuments(filter);

    // Execute both queries concurrently
    const [products, totalProducts] = await Promise.all([
        productsQuery.exec(),
        totalProductsQuery.exec()
    ]);


    // --- Calculate Pagination Info ---
    const totalPages = Math.ceil(totalProducts / limit);

    // --- Send Response ---
    res.json({
      products,
      page,
      limit,
      totalPages,
      totalProducts,
    });

  } catch (err) {
    console.error('Get All Products Error:', err.message);
    // Handle potential errors like invalid query parameters if needed
    res.status(500).send('Server Error');
  }
});


export default router;
