const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  text: {
    type: String,
    required: "You must provide a review!"
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply an author"
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
    required: "You must supply a store"
  }
});

function autoPopulate(next) {
  this.populate('author');
  next();
}

reviewSchema.pre('find', autoPopulate);

reviewSchema.pre('findOne', autoPopulate);

module.exports = mongoose.model("Review", reviewSchema);
