const path = require('path');

const express = require('express');
const {body} = require('express-validator')

const isAuth = require('../middleware/is-auth')

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', 
[
    body('title')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('description')
        .isLength({min: 5, max: 400})
        .trim(),
    body('price')
        .isFloat(),
],
isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', 
[
    body('title')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('description')
        .isLength({min: 5, max: 400})
        .trim(),
    body('price')
        .isFloat(),
],
isAuth, adminController.postEditProduct);

router.delete('/product/:productId', adminController.deleteProduct);

module.exports = router;
