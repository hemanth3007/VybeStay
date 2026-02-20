const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const wrapAsync = require("../utils/wrapAsync.js");
const usersController = require("../controllers/users.js");

router
  .route("/signup")
  .get(usersController.renderSignupForm) // render the signup form
  .post(saveRedirectUrl, wrapAsync(usersController.signup)); // handle the signup logic

router
  .route("/login")
  .get(usersController.renderLoginForm) // render the login form
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    usersController.login,
  ); // handle the login logic

router.route("/logout").get(usersController.logout); // handle the logout logic

module.exports = router;
