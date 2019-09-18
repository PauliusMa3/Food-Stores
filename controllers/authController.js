const passport = require("passport");
const User = require("../models/User");
const crypto = require("crypto");
const mailer = require('../handlers/mail');

exports.login = passport.authenticate("local", {
  successFlash: "You have successfully logged in!",
  successRedirect: "/",
  failureFlash: "Authentication failed!",
  failureRedirect: "/login"
});

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out!");
  res.redirect("/");
};

exports.authenticate = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  req.flash("error", "You need to log in!");
  res.redirect("/login");
};

exports.forgot = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    req.flash(
      "success",
      "If this email exists, password reset has been mailed to you"
    );
    res.redirect("/login");
  }

  user.resetToken = crypto.randomBytes(20).toString("hex");
  user.resetTokenExpiry = Date.now() + 3600000;

  await user.save();

  const resetURL = `http:${req.headers.host}/account/reset/${user.resetToken}`;

  await mailer.send({
    user,
    filename: 'password-reset',
    subject: 'Password Reset',
    resetURL
  })

  req.flash(
    "success",
    `If this email exists, password reset has been mailed to you!`
  );
  res.redirect("/login");
};

exports.reset = async (req, res) => {
  const user = User.findOne({
    resetToken: req.params.token,
    resetTokenExpiry: { $gte: Date.now() }
  });

  if (!user) {
    req.flash("error", "Your password reset token is invalid or expired");
    return res.redirect("/login");
  }

  res.render("reset");
};

exports.confirmPasswords = (req, res, next) => {
  if (req.body.password === req.body["confirm-passwrod"]) {
    next();
    return;
  }

  req.flash("error", "Passwords do not match!");

  res.redirect("back");
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    req.flash("error", "Your password reset token is invalid or expired");
    return res.redirect("/login");
  }
  await user.setPassword(req.body.password);

  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash("success", "Passwords has been reset. You  are now logged in!");

  res.redirect("/");
};
