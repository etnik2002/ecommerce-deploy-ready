const multer = require('multer');

//product upload

const catSorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/categories');
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + ' - ' + file.originalname);
  },
});

const catUpload = multer({ storage: catSorage });

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/products');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const productUpload = multer({ storage: productStorage });

module.exports = { productUpload, catUpload };
