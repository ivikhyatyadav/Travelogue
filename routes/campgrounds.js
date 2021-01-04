var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground.js");
var Comment    = require("../models/comment.js");
var Review    = require("../models/review");
var middleware = require("../middleware");

 

// INDEX - show all campgrounds
// router.get("/", function(req, res) {
//         req.user;
//         // Get all campgrounds from db
//         Campground.find({}, function(err, allCampgrounds) {
//             if(err) {
//                 console.log(err);
//             } else {
//                 res.render("campgrounds/index", {campgrounds: allCampgrounds});
//             }
//         });
// });

// Define escapeRegex function to avoid regex DDoS attack
const escapeRegex = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// INDEX -show all campgrounds
router.get("/", function(req, res) {
  let noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Campground.find({name: regex}, function(err, allCampgrounds) {
      if (err) { console.log(err); }
      else {
        if (allCampgrounds.length < 1) {
          noMatch = "No campgrounds found, please try again.";
        }
        res.render("campgrounds/index", { campgrounds: allCampgrounds, page: "campgrounds", noMatch: noMatch });  
      }
    });
  } else {
    // Get all camgrounds from DB
    Campground.find({}, function(err, allCampgrounds) {
      if (err) { console.log(err); }
      else {
        res.render("campgrounds/index", { campgrounds: allCampgrounds, page: "campgrounds", noMatch: noMatch });  
      }
    }); 
  }
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var cost = req.body.cost;
    var image = req.body.image;
    var desc = req.body.description;
    var location = req.body.location;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    
    var newCampground = {name: name, cost: cost, image: image, description: desc, author: author, location: location}
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
        if(err) {
            console.log(err);
        } else {
            // redirect back to campgrounds page
            newlyCreated.save();
            res.redirect("/campgrounds");
        }
    });
});


// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    // find the camp page
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err, foundCampground) {
        if(err) {
            console.log(err)
        } else {
            // if campground is not found
            if (!foundCampground) {
                return res.status(400).send("Item not found.")
            }
            // render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT - edits campgrounds
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err) {
            req.flash("error", "You don't have permission to do this");
        } else {
            if (!foundCampground) {
                return res.status(400).send("Item not found.")
            }
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// UPDATE - updates campgrounds
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
// });

// DESTROY - destroys campgrounds
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("/campgrounds");
        } else {
            // res.redirect("/campgrounds");
            // deletes all comments associated with the campground
            Comment.remove({"_id": {$in: Campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    // return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: Campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        // return res.redirect("/campgrounds");
                    }
                    //  delete the campground
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/campgrounds");
                });
            });
        }
    });
});


module.exports = router;