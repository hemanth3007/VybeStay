const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const review = require("./reviews.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    max: 50,
  },
  description: {
    type: String,
    max: 500,
  },
  image: {
    url: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdw39VXF520CJWPbA87iF4CuygWiZTNH69Cg&s",
      set: (v) =>
        v === ""
          ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdw39VXF520CJWPbA87iF4CuygWiZTNH69Cg&s"
          : v,
    },
    filename: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  category: {
    type: String,
    enum: [
      "Trending",
      "Rooms",
      "Villas",
      "Iconic Cities",
      "Mountains",
      "Castles",
      "Amazing Pools",
      "Camping",
      "Farms",
      "Artic",
    ],
    required: true,
  },
});

// Mongoose middleware to delete all reviews assosciated to a listing when that particular listing is deleted.
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) await review.deleteMany({ _id: { $in: listing.reviews } });
});

const listings = mongoose.model("listing", listingSchema);
module.exports = listings;
