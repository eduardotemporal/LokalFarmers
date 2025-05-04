import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true // Store price at the time of order
  }
}, { _id: false }); // Don't create separate _id for subdocuments unless needed

const orderSchema = new mongoose.Schema({
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for faster lookup of consumer orders
  },
  products: [orderItemSchema], // Array of ordered items using the sub-schema
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  shippingAddress: { // Optional shipping address
    street: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String }
  },
  // Consider adding farmer details to products array if needed for farmer order lookup efficiency
  // Example: farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } in orderItemSchema
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Optional: Index for status if frequently queried
// orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
