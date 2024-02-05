const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema } = require("./schemas.js");
const { reviewSchema } = require("./schemas.js");
const Campground = require('./models/campground');
const Review = require('./models/review');
const catchAsync = require("./utils/catchAsync");
const review = require("./models/review");
const campground = require("./models/campground");

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
    console.log("Database Connected");
})

const app = express();

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }

}

app.get("/", (req, res) => {
    res.render('home');
})

app.get('/campground', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });

})

app.get('/campground/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campground', validateCampground, catchAsync(async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campground/${campground._id}`);
}))

app.put('/campground/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campground/${campground._id}`);
}))

app.delete('/campground/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
}))

app.get('/campground/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate("reviews")
    res.render('campgrounds/show', { campground });
}))

app.get('/campground/:id/edit', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

app.post('/campground/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campground/${campground._id}`);
}))

app.delete('/campground/:id/reviews/:reviewId', catchAsync(async (req, res) =>{
    const { id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campground/${id}`)
}))

app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!"
    res.status(statusCode).render("error", { err });
})

app.listen(3000, () => {
    console.log(`Serving on port 3000`)
})