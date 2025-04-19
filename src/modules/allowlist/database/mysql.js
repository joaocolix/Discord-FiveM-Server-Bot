const Sequelize = require("sequelize");
const config = require('../../../configs/database.json')

var db = config.database
var user = config.user
var port = config.port
var host = config.host
var pass = config.password

const connection = new Sequelize(db,user,pass,{
    host: host,
    port: port,
    dialect: 'mysql',
    logging: false
});

module.exports = connection;