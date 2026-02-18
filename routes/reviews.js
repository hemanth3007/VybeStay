const express = require("express");
const router = express.Router({ mergeParams: true });

const multer = require("multer");
const upload = multer({ dest: "/uploads" });

const wrapAsync = require("../utils/wrapAsync.js");
const {
  isLoggedIn,
  validateReview,
  isReviewAuthor,
} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

//Reviews
router
  .route("/")
  .post(
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createNewReview),
  );

//Delete Reviews Route
router
  .route("/:reviewId")
  .delete(isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;
