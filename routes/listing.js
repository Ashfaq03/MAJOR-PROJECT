const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js"); // Import the Listing model
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

//get route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    // console.log(allListings);
    res.render("listings/index.ejs", { allListings });
  })
);

//new route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

//show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs", { listing });
  })
);

//create route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    // wrapAsync is a function that wraps around an async function and catches any errors that occur
    // let { title, description, price, location, country } = req.body;

    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    await newlisting.save();
    // console.log(newlisting);
    req.flash("success", "New Listing Created!");
    res.redirect(`/listings`);
  })
);

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

//update route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    // const listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
    //   runValidators: true,
    //   new: true,
    // });
    const listing = await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
    });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${listing._id}`);
  })
);

//delete listing route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;
