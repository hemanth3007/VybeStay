if (process.env.NODE_ENV != "production") require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session"); // To create session in a local machine and helps for session while hosting online
const MongoStore = require("connect-mongo").default; // To create session when hosted online
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const dbUrl = process.env.ATLASDB_URL; // If password contains '@' use %40 instead of that in place of password

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);

const User = require("./models/user.js");
const expressError = require("./utils/ExpressError.js");

const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");

// Connect to MongoDB
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

// Mongo Store for session hosted online
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

// Session Configuration
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 24 * 60 * 60 * 7, // 1 week
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration - **** pbkdf2 hashing algorithm ****
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Cookie Parser Middleware
app.use(cookieParser());

// Flash-Message Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.search = req.query.search || ""; // To store search string
  res.locals.selectedCategory = req.query.category || ""; // To store filters
  next();
});

app.locals.mapToken = process.env.MAPTILER_API;

// Listings and Reviews route
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Wrong Route Handler
app.use((req, res, next) => {
  next(new expressError(404, "Page Not Found!"));
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Server is listening at the port 8080");
});
