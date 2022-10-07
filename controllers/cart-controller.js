const Product = require('../models/Product');
const User = require('../models/User');

module.exports = {
  getAddToCart: async (req, res) => {
    const cart = [];

    const selectedProduct = await Product.find({ _id: req.params.id });
    cart.push(selectedProduct);
    console.log({ cart });
    console.log({ selectedProduct });
  },
};
