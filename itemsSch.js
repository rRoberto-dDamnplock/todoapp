const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
content: String,
  
  });

  module.exports = mongoose.model("Item", itemSchema)
