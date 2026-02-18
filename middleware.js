const listings = require("./models/listing.js");
const reviews = require("./models/reviews.js");
const expressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const { equal } = require("joi");

// JOI Validation Middleware
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new expressError(400, errMsg);
  } else next();
};

// JOI Validation Middleware for Listings
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new expressError(400, errMsg);
  } else next();
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    if (req.session) req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session && req.session.redirectUrl) {
    let redirectUrl = req.session.redirectUrl;
    if (redirectUrl.includes("/reviews")) {
      // /listings/:id/reviews/:reviewId
      let parts = redirectUrl.split("/");
      let listingId = parts[2]; // ID is always at index 2
      res.locals.redirectUrl = `/listings/${listingId}`;
    } else res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;
  }
  next();
};

// module.exports.saveRedirectUrl = (req, res, next) => {
//   if (req.session && req.session.redirectUrl) {
//     res.locals.redirectUrl = req.session.redirectUrl;
//     delete req.session.redirectUrl;
//   }
//   next();
// };

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await listings.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash(
      "error",
      "You don't have permission to edit/delete this listing!",
    );
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await reviews.findById(reviewId);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to delete this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
