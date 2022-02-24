const User = require('../models/user')
const bcryptjs = require('bcryptjs')
const crypto = require('crypto');
const user = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
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

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: req.flash('error')[0]
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      console.log(err);
      return res.redirect('/login')
    }
    const token = buffer.toString('hex')
    User.findOne({email: req.body.email})
      .then(user => {
        if(!user) {
          req.flash('error', 'Email doesnt exists')
          return res.redirect('/login')
        }
        user.resetToken = token,
        user.resetTokenExpiration = Date.now() + 3600000
        return user.save()
      })
      .then(result => {
        res.redirect(`/reset/${token}`)
      })
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: req.flash('error')[0],
        userId: user._id,
        passwordToken: token
      });
    })
    .catch(err => console.log(err))
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password
  const token = req.body.passwordToken
  let resetUser
  User.findOne({_id: req.body.userId, resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
      resetUser = user
      return bcryptjs.hash(newPassword, 12)
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword
      resetUser.resetToken = undefined
      resetUser.resetTokenExpiration = undefined
      return resetUser.save()
    })
    .then(result => {
      res.redirect('/login')
    })
    .catch(err => console.log(err))
}
