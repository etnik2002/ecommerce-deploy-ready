const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    productID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    customerName: {
      type: String,
    },
    customerEmail: {
      type: String,
    },
    customerPhone: {
      type: String,
    },
    customerAddress: {
      type: String,
    },
    customerCity: {
      type: String,
    },
    productPrice: {
      type: Number,
    },

    discount: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

orderSchema.index({ order: 'text' });
module.exports = mongoose.model('Order', orderSchema);
