const Sequelize = require('sequelize');
const db = require('../config/database');

const SearchHistory = db.define('searchhistory', {
    admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
    },
});

SearchHistory.sync().then(() => {
  console.log('table created');
});

module.exports = SearchHistory;