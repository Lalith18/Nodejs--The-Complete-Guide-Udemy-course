const Product = require('../models/product');
const Order = require('../models/order');
const order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit')
const stripe = require('stripe')('sk_test_51J1SmXSHSEz5SAKILUR9gejzmLFVlNqapKPfP6kanG0hJNjPBjxxLSxfBMhsgWP3ma0g8ojomideIf0P4j1SljAN00Tf0Z8qEA')

const NO_OF_PRODUCTS = 1;


exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts
  Product.find().countDocuments().then(
    numProducts => {
      totalProducts = numProducts;
      return Product.find()
      .skip((page-1)*NO_OF_PRODUCTS).limit(NO_OF_PRODUCTS)
    })
  .then(products => {
      return res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: page*NO_OF_PRODUCTS < totalProducts,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalProducts/NO_OF_PRODUCTS)
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      return res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts
  Product.find().countDocuments().then(
    numProducts => {
      totalProducts = numProducts;
      return Product.find()
      .skip((page-1)*NO_OF_PRODUCTS).limit(NO_OF_PRODUCTS)
    })
  .then(products => {
      return res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: page*NO_OF_PRODUCTS < totalProducts,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalProducts/NO_OF_PRODUCTS)
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      return res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getCheckout = (req, res, next) => {
  let products
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .then(user => {
      products = user.cart.items;
      total = 0;
      products.forEach(prod => {
        total += prod.quantity*prod.productId.price;
      })
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price*100,
            currency: 'usd',
            quantity: p.quantity
          }
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success' ,
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      })
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,
        sessionId: session.id
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      return res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      return res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};


exports.getInvoice = (req,res,next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId).then(order => {
    if(!order) {
      return next(new Error('No order found.'))
    }
    if(order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized'))
    }
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data','invoices',invoiceName);
    res.setHeader('Content-Type','application/pdf')
    res.setHeader('Content-disposition', 'inline; filename="' + invoiceName + '"')
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    pdfDoc.fontSize(26).text('Invoice',{underline: true})
    pdfDoc.text('------------------')
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice += prod.quantity*prod.product.price;
      pdfDoc.fontSize(16).text(prod.product.title + ' - ' + prod.quantity + ' x $' + prod.product.price )
    })
    pdfDoc.text('------------')
    pdfDoc.fontSize(20).text('Total Price = ' + totalPrice)
    pdfDoc.end()
  }).catch(err => next(err))
  

}