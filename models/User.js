const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    userRole: {
      type: String,
      enum: ['user', 'admin', 'ceo'],
      default: 'user',
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    liked: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', unique: true },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
