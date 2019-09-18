const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require("../handlers/errorHandlers");
const {
  check,
  validationResult,
  sanitizeBody,
  body
} = require("express-validator");

// Do work here
router.get("/", catchErrors(storeController.getStores));
router.get("/stores", catchErrors(storeController.getStores));
router.get("/add", authController.authenticate, storeController.addStore);

router.post(
  "/add/:id",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

router.post(
  "/add",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);

router.get("/reverse/:name", (req, res) => {
  const reversed = [...req.params.name].reverse().join("");

  res.send(reversed);
});

router.get("/stores/:id/edit", catchErrors(storeController.editStore));

router.get("/store/:slug", storeController.getStore);

router.get("/tags", catchErrors(storeController.getTags));

router.get("/tags/:tag", catchErrors(storeController.getTags));

router.get("/login", userController.login);

router.post("/login", authController.login);

router.get("/register", userController.registerForm);

router.post(
  "/register",
  [
    sanitizeBody("name"),
    check("name", "You must supply a name!")
      .not()
      .isEmpty(),
    check("email", "That Email is not valid!").isEmail(),
    sanitizeBody("email").normalizeEmail({
      remove_dots: false,
      remove_extension: false,
      gmail_remove_subaddress: false
    }),

    check("password", "Password Cannot be blank!")
      .not()
      .isEmpty(),
    check("confirm-password", "Oops! Your Passwords do not match!")
      .not()
      .matches("password")
  ],
  userController.register,
  authController.login
);

router.get("/logout", authController.logout);

router.get("/account", userController.account);

router.post("/account", catchErrors(userController.updateAccount));

router.post("/account/forgot", catchErrors(authController.forgot));

router.get("/account/reset/:token", catchErrors(authController.reset));

router.post('/account/reset/:token', authController.confirmPasswords, catchErrors(authController.update));

// API Endpoints

router.get('/api/search', catchErrors(storeController.searchStores));

router.get('/api/stores/near', catchErrors(storeController.getNearestStores));

router.get('/map', catchErrors(storeController.mapStores));

router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore))

router.get('/hearts', authController.authenticate, catchErrors(storeController.getHearts));

router.post('/reviews/:id', authController.authenticate, catchErrors(reviewController.addReview));

router.get('/top', catchErrors(storeController.getTopStores));


router.get('/stores/page/:page', catchErrors(storeController.getStores))

module.exports = router;
