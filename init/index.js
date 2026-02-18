require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");

const dbUrl = process.env.ATLASDB_URL;
const Listings = require("../models/listing.js");

const maptiler = require("@maptiler/client");
maptiler.config.apiKey = process.env.MAPTILER_API;

// To run this file always be in root folder and run using the command "node init/index.js"

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB...", err);
  });

const initDB = async () => {
  await Listings.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6994b9d080ee31a9e821a1ab",
  }));

  for (let listing of initData.data) {
    // Reinitializing data to add map function to all sample data.
    const response = await maptiler.geocoding.forward(listing.location, {
      limit: 1,
    });
    listing.geometry = response.features[0].geometry; // To save coordinates
  }

  await Listings.insertMany(initData.data);
  console.log("Database initialized with sample data");
};

initDB();
