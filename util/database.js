const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete','root','L@ftie1806', {dialect: 'mysql', host: 'localhost'})

module.exports = sequelize;