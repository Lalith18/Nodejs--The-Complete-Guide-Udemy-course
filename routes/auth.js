const express = require('express');
const {check, body} = require('express-validator')

const authController = require('../controllers/auth');
const User = require('../models/user')

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/logout', authController.postLogout);

router.post('/login',
    [
        body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .normalizeEmail(),
        body('password', 'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
    ],
     authController.postLogin)

router.get('/signup', authController.getSignup);

router.post('/signup', 
    [check('email').isEmail().withMessage('Enter a valid email').custom((value, {req}) => {
        return User.findOne({email: value}).then(userData => {
            if(userData) {
              return Promise.reject('Email already exists')
            }
          })
        })
        .normalizeEmail(),
        body('password','Enter a passowrd with atleast 5 alpanumeric characters').isLength({min: 5}).isAlphanumeric()
        .trim(),
        body('confirmPassword').custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords should match!')
            }
            return true
        })
        .trim()
    ], 
    authController.postSignup);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;