if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session")
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/User.js");

const ExpressError = require("./utils/ExpressError");

const userRouter = require('./routes/user.js');
const campgroundRouter = require('./routes/campground.js');
const reviewRouter = require('./routes/reviews.js');

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
app.use(express.static(path.join(__dirname, 'public')));


const sessionConfig = {
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get("/", (req, res) => {
    res.render('home');
});

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'benison@gmail.com', username: 'benison' });
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
});

app.use('/', userRouter);

app.use('/campgrounds', campgroundRouter);

app.use('/campgrounds/:id/reviews', reviewRouter);

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