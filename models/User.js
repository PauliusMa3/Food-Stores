const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const md5 = require("md5");
const validator = require("validator");
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid Email Address"],
    required: "Please supply an email address!",
    unique: true
  },
  name: {
    type: String,
    trim: true,
    required: "Please supply a name!"
  },
  resetToken: String,
  resetTokenExpiry: Number,
  hearts: [{ type: mongoose.Schema.ObjectId, ref: "Store" }]
});

userSchema.virtual("gravatar").get(function() {
  const hash = md5(this.email);

  return `https://www.gravatar.com/avatar/${hash}`;
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
});

userSchema.plugin(mongodbErrorHandler);
module.exports = mongoose.model("User", userSchema);
