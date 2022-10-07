const mongoose = require('mongoose');
const { db } = require('./models/User');
require('dotenv').config();

const lidhuMeDatabase = async () => {
  try {
    const connect = mongoose.connect(
      'mongodb+srv://etnik:Etnik002@cluster0.gcfqm8o.mongodb.net/?retryWrites=true&w=majority',
      { useNewUrlParser: true, useUnifiedTopology: true }
    );

    console.log('database u lidh me sukses');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = lidhuMeDatabase;
