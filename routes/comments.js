var express    = require("express");
var router     = express.Router({mergeParams: true});
var Campground = require("../models/campground.js");
var Comment    = require("../models/comment.js");
var middleware = require("../middleware");



// ======================
// COMMENTS ROUTES
// ======================

// NEW COMMENT ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res) {
    // find campground by id
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    });
   
});

// Create Comments
router.post("/", middleware.isLoggedIn, function(req, res) {
    //lookup campground by ID
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err);
            res.direct("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong!");
                    console.log(err);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    // create new comment
                    campground.comments.push(comment);
                    // connect new comment to campground
                    campground.save();
                    // redirect to campground show page
                    req.flash("success","You've succesfully created a new comment!");
                    res.redirect("/campgrounds/" + campground._id);
                    
                }
            });
        }
        
    });
});

// EDIT COMMENT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function (err, foundCommment) {
        if(err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundCommment});
        }
    });
})

// UPDATE COMMENT ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if(err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


// DELETE COMMENT ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted!")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


module.exports = router;
