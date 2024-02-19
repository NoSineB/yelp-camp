const express = require('express');
const router = express.Router();
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const user = require('../controllers/user')

router.route('/register')
    .get(user.getRegisterForm)
    .post(user.createUser);

router.route('/login')
    .get(user.userLoginForm)
    .post(
        // use the storeReturnTo middleware to save the returnTo value from session to res.locals
        storeReturnTo,
        // passport.authenticate logs the user in and clears req.session
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        // Now we can use res.locals.returnTo to redirect the user after login
        user.userLogin);


router.get('/logout', user.userLogout);

module.exports = router;