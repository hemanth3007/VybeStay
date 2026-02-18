const listings = require("../models/listing.js");
const review = require("../models/reviews.js");

module.exports.createNewReview = async (req, res) => {
  let listing = await listings.findById(req.params.id);
  let newReview = new review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "Successfully added a review!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await listings.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/listings/${id}`);
};
