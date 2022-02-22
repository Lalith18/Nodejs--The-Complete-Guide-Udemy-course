const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const mongoose = require('mongoose')

const User = require('./models/user')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    User.findById('6213698464d0d3a1cd16207e')
    .then(user => {
        req.user = user
        next()
    })
    .catch(err => console.log(err))
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://lalith:L%40ftie1806@cluster0.4hae3.mongodb.net/shop?retryWrites=true&w=majority')
    .then(result => {
        User.findOne().then(user => {
            if(!user) {
                const user = new User({
                    name: 'Lalith',
                    email: 'lalith@mail.com',
                    cart: []
                })
                user.save()
            }
            app.listen(3000)
        })
    })
    .catch(err => console.log(err))