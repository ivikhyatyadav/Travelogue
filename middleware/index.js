var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");

// ALL MIDDLEWARE
var middlewareObj = {};

// check campground ownership    
middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, foundCampground) {
            if(err) {
                req.flash("error", "Campground not found!");
                res.redirect("/campgrounds")
            } else {
                
                // Bug fix
                if (!foundCampground) {
                    req.flash("error", "Campground not found");
                    return res.redirect("back");
                }
                
                 // does user own campground?
                 if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                 } else {
                    req.flash("error", "You dont have permission to do that!");
                    res.redirect("back");
                 }
            }
        });
    } else {
        res.redirect("back");
    }
};

// check comment ownership
middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err) {
                req.flash("error", "Campground not foud")
                res.redirect("back")
            } else {
                 // does user own comment?
                 if(foundComment.author.id.equals(req.user._id)) {
                    next();
                 } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                 }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
};

// check review ownership
middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

// check review existence
middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("back");
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};


// isloggedIn Middleware
middlewareObj.isLoggedIn = function (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
};




module.exports = middlewareObj;