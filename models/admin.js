const Sequelize = require('sequelize');
const db = require('../config/database');

const Admin = db.define('admin', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Admin.sync().then(() => {
  console.log('table created');
});

module.exports = Admin;