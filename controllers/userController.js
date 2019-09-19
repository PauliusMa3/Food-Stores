const User = require("../models/User");
const {promisify} = require("es6-promisify");

const { validationResult } = require("express-validator");
exports.login = (req, res) => {
  res.render("login", { title: "Login" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "Register" });
};

exports.register = async (req, res, next) => {
  const result = validationResult(req);

  if (result.errors.length !== 0) {
    req.flash("error", result.errors.map(error => error.msg));

    res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash()
    });
  }
  const user = new User({ email: req.body.email, name: req.body.name });

  const register = promisify(User.register, User);

  await register(user, req.body.password);
  next();
};

exports.account = (req, res) => {
  res.render("account", { title: "Edit Your Profile" });
};

exports.updateAccount = async (req, res) => {
  const userUpdates = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: userUpdates },
    { new: true, runValidators: true, context: "query" }
  );

  req.flash("success", "Successfully updated Profile!");

  res.redirect("back");
};
