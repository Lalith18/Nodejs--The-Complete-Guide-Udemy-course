const mongodb = require('mongodb')

const getDb = require('../util/database').getDb

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title
    this.price = price
    this.description = description
    this.imageUrl = imageUrl
    this._id = id ? mongodb.ObjectId(id) : null
    this.userId = mongodb.ObjectId(userId)
  }

  save() {
    const db = getDb()
    let dbop;
    if(this._id) {
      dbop = db.collection('products').updateOne({_id: _id}, {$set: this})
    } else {
      dbop = db.collection('products').insertOne(this)
    }
    return dbop
            .then(result => console.log(result))
            .catch(err => console.log(err))
  }

  static fetchAll() {
    const db = getDb()
    return db.collection('products').find().toArray()
      .then(products => {
        console.log(products);
        return products
      })
      .catch(err => console.log(err))
  }

  static findById(id) {

    const db = getDb()
    return db.collection('products').find({_id: new mongodb.ObjectId(id)})
      .next()
      .then(product => {
        console.log(product);
        return product
      })
      .catch(err => console.log(err))
  }

  static deleteById(id) {
    const db =getDb()
    return db.collection('products').deleteOne({_id: new mongodb.ObjectId(id)})
      .then( result => {
        console.log('Deleted product!')
      })
      .catch(err => console.log(err))
  }
  
}

// const Product = sequelize.define('product',{
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   title: Sequelize.STRING,
//   price: {
//     type: Sequelize.DOUBLE,
//     allowNull: false
//   },
//   imageUrl: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   description: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
// });

module.exports = Product