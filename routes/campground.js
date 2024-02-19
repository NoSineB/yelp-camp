const express = require("express");
const router = express.Router();
const campground = require('../controllers/campground.js')
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware.js')

router.route('/')
    .get(catchAsync(campground.index))
    .post(isLoggedIn, validateCampground, catchAsync(campground.createNewCampground))

router.get('/new', isLoggedIn, campground.newCampground)

router.route('/:id')
    .get(catchAsync(campground.getCampgroundById))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campground.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.editCampgroundById))


module.exports = router;