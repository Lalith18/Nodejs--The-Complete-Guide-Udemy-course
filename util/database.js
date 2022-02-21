const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://lalith:L%40ftie1806@cluster0.4hae3.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            callback()
            _db = client.db()
        })
        .catch(err => {
            console.log(err)
            throw err
        })
}

const getDb = () => {
    if(_db) {
        return _db
    }
    throw "No database found!"
}

exports.getDb = getDb
exports.mongoConnect = mongoConnect