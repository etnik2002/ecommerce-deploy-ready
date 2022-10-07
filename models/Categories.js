const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = Schema(
  {
    catName: {
      type: String,
      trim: true,
      unique: true,
    },
    catDesc: {
      type: String,
    },
    catSlug: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
    },
    catImg: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
