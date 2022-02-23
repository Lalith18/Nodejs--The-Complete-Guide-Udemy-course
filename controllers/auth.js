const User = require('../models/user')
const bcryptjs = require('bcryptjs')

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: req.flash('error')[0]
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  User.findOne({email: email})
  .then(user => {
    if(!user) {
      req.flash('error', 'Invalid email or password')
      return res.redirect('/login')
    }
    bcryptjs.compare(password, user.password)
      .then(doMatch => {
        if(doMatch) {
          req.session.isLoggedIn = true
          req.session.user = user
          return req.session.save(err => {
            console.log(err)
            res.redirect('/')
          })
        }
        req.flash('error', 'Invalid email or password')
        res.redirect('/login')
      })
      .catch(err => {
        console.log(err)
        res.redirect('/login')
      })
  })
  .catch(err => console.log(err))
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/')
  })
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: req.flash('error')[0]
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword
  User.findOne({email: email}).then(userData => {
    if(userData) {
      req.flash('error', 'Email already exists')
      return res.redirect('/signup')
    }
    return bcryptjs.hash(password, 12)
  })
  .then(hashedPassword => {
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: {items: []}
    })
    return user.save()
  })
  .then(result => {
    res.redirect('/login')
  })
  .catch(err => console.log(err))
};


