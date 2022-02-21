const Product = require('../models/product');
// const Cart = require('../models/cart')

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    })
  })
  .catch(err => { console.log(err)})
};

exports.getProduct = (req, res, next) => {
  const id = req.params.productId
  Product.findById(id)
  .then(product => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    })
  })
  .catch(err => { console.log(err)})
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err => { console.log(err)})
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then(products => {
    console.log(products);
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      cartData: products
    });
  })
  .catch(err => console.log(err))
  // Cart.getCart(cart => {
  //   Product.fetchAll(products => {
  //     const cartData = []
  //     products.forEach(product => {
  //       const cartProduct = cart.products.find(prod => prod.id === product.id)
  //       if(cartProduct) {
  //         cartData.push({productData: product, qty: cartProduct.qty})
  //       }
  //     });
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       cartData: cartData
  //     });
  //   })
  // })
};

exports.postCart = (req, res, next) => {
  const id =  req.body.productId
  Product.findById(id)
  .then(product => {
    return req.user.addToCart(product)
  })
  .then(result => {
    console.log(result)
    res.redirect('/cart')
  })
  .catch(err => console.log(err))
  // let newQuantity = 1
  // let fetchedCart
  // req.user.getCart()
  // .then(cart => {
  //   fetchedCart = cart
  //   return cart.getProducts({where: {id: id}})
  // })
  // .then(products => {
  //   let product
  //   if(products.length > 0) {
  //     product = products[0]
  //   }
  //   if(product) {
  //     newQuantity = product.cartItem.quantity + 1
  //     return product
  //   }
  //   return Product.findByPk(id)
  // })
  // .then(product => {
  //   return fetchedCart.addProduct(product, {through: {quantity: newQuantity}})
  // })
  // .then(() => {
  //   res.redirect('/cart')
  // })
  // .catch(err => console.log(err))
}

exports.postDeleteCartItem = (req, res, next) => {
  const id = req.body.productId
  req.user.deleteItemFromCart(id)
  .then(result => {
    res.redirect('/cart')
  })
  .catch(err => console.log(err))
}

exports.postOrder = (req,res,next) => {
  req.user.addOrder()
  .then(result => {
    res.redirect('/orders')
  })
  .catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders()
  .then(orders => {
    console.log('orders',orders);
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  })
  .catch(err => console.log(err))
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
