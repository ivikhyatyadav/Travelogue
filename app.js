var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    flash          = require("connect-flash"),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    methodOverride = require("method-override"),
    Campground     = require("./models/campground");
    
 var   Comment        = require("./models/comment"),
    User           = require("./models/user"),
    seedDB         = require("./seeds");

// requiring routes
var commentsRoutes   = require("./routes/comments"),
    reviewRoutes     = require("./routes/review"),
    indexRoutes      = require("./routes/index.js"),
    campgroundRoutes = require("./routes/campgrounds");
    

mongoose.connect('mongodb://localhost:27017/Travelogue', {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log('connection open');
})
.catch(err=>{
    console.log('error');
    console.log(err);
})

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); // seed the database

app.locals.moment = require("moment");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Secret page",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// currentUser middleware
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.use("/", indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments", commentsRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.get('/listyourland',(req,res)=>{
    res.render('listyourland')
})

app.listen(5600,()=>{
    console.log('listeing on port 5600');
})