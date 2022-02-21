const mongodb = require('mongodb')

const ObjectId = mongodb.ObjectId

const getDb = require('../util/database').getDb

class User {
    constructor(username, email, cart, id) {
        this.name = username
        this.email = email
        this.cart = cart
        this._id = new ObjectId(id)
    }

    save() {
        const db = getDb()
        return db.collection('users').insertOne(this)
                .then(result => console.log(result))
                .catch(err => console.log(err))
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString()
        })
        let newQuantity = 1
        const updatedCartItems = [...this.cart.items]
        const db = getDb()
        if(cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1
            updatedCartItems[cartProductIndex].quantity = newQuantity
        } else {
            updatedCartItems.push({productId: product._id, quantity: newQuantity})
        }
        const updatedCart = {items: updatedCartItems}
        return db.collection('users').updateOne({_id: this._id}, {$set: {cart: updatedCart}})
    }

    getCart() {
        const db = getDb()
        const productIds = this.cart.items.map(item => {
            return item.productId
        })
        return db.collection('products').find({_id: {$in: productIds}}).toArray().then(products => {
            return products.map(product => {
                return {...product, quantity: this.cart.items.find(p => {
                    return p.productId.toString() === product._id.toString()
                }).quantity
                }
            })
        })

    }

    deleteItemFromCart(productId) {
        const db = getDb()
        const updatedCartItems = this.cart.items.filter(p => {
            return p.productId.toString() !== productId.toString()
        })
        return db.collection('users').updateOne({_id: this._id}, {$set: {cart: {items: updatedCartItems}}})

    }

    addOrder() {
        const db = getDb()
        return this.getCart().then(products => {
            const order = {
                items: products,
                user: {
                    _id: this._id,
                    name: this.name
                }
            }
            return db.collection('orders').insertOne(order).then(result => {
                this.cart = {items: []}
                return db.collection('users').updateOne({_id: this._id}, {$set: {cart: {items: []}}})
            })
        })
    }

    getOrders() {
        const db = getDb()
        return db.collection('orders').find({'user._id': this._id}).toArray()
    }

    static findById(id) {
        const db = getDb()
        return db.collection('users').findOne({_id: new mongodb.ObjectId(id)})
                .then(user => {
                    console.log(user);
                    return user
                })
                .catch(err => console.log(err))
    }

}

module.exports = User;