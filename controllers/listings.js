const listings = require("../models/listing.js");

const maptiler = require("@maptiler/client");
maptiler.config.apiKey = process.env.MAPTILER_API; // To store coordinates in the Database

// module.exports.renderIndex = async (req, res) => {   Normal renderIndex page rendering all Listings
//   const allListings = await listings.find({});
//   res.render("listings/index.ejs", { listings: allListings });
// };

module.exports.renderIndex = async (req, res) => {
  const { search, category } = req.query;
  let query = {};
  let allListings;
  if (search && search.trim() !== "") {
    const searchQuery = search.trim();
    query.$or = [
      { location: { $regex: searchQuery, $options: "i" } },
      { country: { $regex: searchQuery, $options: "i" } },
    ];
  }
  if (category && category.trim() !== "") query.category = category;
  allListings = await listings.find(query);
  res.render("listings/index.ejs", { listings: allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createNewListing = async (req, res) => {
  const response = await maptiler.geocoding.forward(req.body.listing.location, {
    limit: 1,
  }); // To store coordinates in the Database
  const newListing = new listings(req.body.listing);
  newListing.owner = req.user._id;
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { url, filename };
  }
  newListing.geometry = response.features[0].geometry; // To save coordinates
  await newListing.save();
  req.flash("success", "Successfully added a new listing!");
  res.redirect("/listings");
};

module.exports.renderShowPage = async (req, res) => {
  let { id } = req.params;
  const listing = await listings
    .findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Requested listing does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await listings.findById(id);
  if (!listing) {
    req.flash("error", "Requested listing for edit does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace(
    "/upload",
    "/upload/h_300,w_350,e_blur:200",
  );
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.renderUpdateListing = async (req, res) => {
  let { id } = req.params;
  const response = await maptiler.geocoding.forward(req.body.listing.location, {
    limit: 1,
  });
  if (!response.features.length) {
    req.flash("error", "Invalid location entered");
    return res.redirect(`/listings/${id}/edit`);
  }
  let listing = await listings.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true },
  );
  listing.geometry = response.features[0].geometry;
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }
  await listing.save();
  req.flash("success", "Successfully updated the listing!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await listings.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted a listing!");
  res.redirect("/listings");
};
