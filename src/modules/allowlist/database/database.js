const Sequelize = require("sequelize");
const connection = require("./mysql")


var whitelist = connection.define('accounts', {
    whitelist: {
        type: Sequelize.STRING,
        Allownull: true
    },
    discord: {
        type: Sequelize.STRING,
        Allownull: true
    },
    last_login: {
        type: Sequelize.DATE,
        allowNull: true
    }
}, {
    timestamps: false,
    freezeTableName: true
})

module.exports = { whitelist}