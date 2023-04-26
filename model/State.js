// NPM module
const mongoose = require("mongoose");

// Mongoose schema
const Schema = mongoose.Schema;

const stateSchema = new Schema({
  stateCode: {
    type: String,
    required: true,
    unique: true,
  },
  funfacts: [String],
});

// Creates a model, instance of a document
module.exports = mongoose.model("State", stateSchema);
