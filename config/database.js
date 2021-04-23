const Sequelize = require('sequelize');

const db =  new Sequelize('mediumcrawldb', 'postgres', '9939105936', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

module.exports = db;