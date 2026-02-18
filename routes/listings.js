const express = require("express");
const router = express.Router();

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const listingsController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// New listing form
router.route("/new").get(isLoggedIn, listingsController.renderNewForm);

// Index route, New Listing route [/listings]
router
  .route("/")
  .get(wrapAsync(listingsController.renderIndex))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),  
    validateListing,
    wrapAsync(listingsController.createNewListing),
  );

// Show page, Update Listing, Delete Listing [/listings/:id]
router
  .route("/:id")
  .get(wrapAsync(listingsController.renderShowPage))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingsController.renderUpdateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingsController.deleteListing));

// Render Edit Form
router
  .route("/:id/edit")
  .get(isLoggedIn, isOwner, wrapAsync(listingsController.renderEditForm));

module.exports = router;
