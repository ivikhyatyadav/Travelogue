var mongoose = require("mongoose");


var reviewSchema = new mongoose.Schema ({
    rating: {
        type: Number,
        required: "Please provide a rating (1-5) stars.",
        // defining min and max values
        min: 1,
        max: 5,
        // adding validation to see if entry is an integer
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an interger."
        }
    },
    text: {
        type: String
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    // campground associated with review
    campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground"
    }
}, {
    //  assigns createdAt and updatedAt fields to schema, the type assigned is Date via mongoose
    timestamps: true
});

module.exports = mongoose.model("Review", reviewSchema);