import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
    // Consider using enum later for predefined categories:
    // enum: ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Other'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  quantity: {
    type: Number,
    required: [true, 'Product quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value for quantity',
    },
  },
  images: [
    {
      type: String, // Array of image URLs or identifiers
    }
  ],
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add text index for searching
productSchema.index({ name: 'text', description: 'text', category: 'text' });

// Optional: Add other indexes for frequently queried fields
// productSchema.index({ farmer: 1 });
// productSchema.index({ category: 1 });


const Product = mongoose.model('Product', productSchema);

export default Product;
