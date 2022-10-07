const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema(
  {
    prodName: {
      type: String,
      required: true,
      index: true,
    },
    prodDesc: {
      type: String,
      required: true,
    },
    prodPrice: {
      type: Number,
      required: true,
    },
    prodCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    prodImg: {
      type: [String],
      required: true,
    },
    size: {
      type: [String],
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    prodColor: {
      type: [String],
    },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text' });
module.exports = mongoose.model('Product', ProductSchema);
