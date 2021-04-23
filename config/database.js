const Sequelize = require('sequelize');
let db;
  const postgreUri = 'postgres://biohutpetsbuxn:81f6023d3ff26391a6b290ee7e8f906b9a6fea9ac23a16f7b16874a4cd05cec0@ec2-3-233-7-12.compute-1.amazonaws.com:5432/d8ghc7vsej2q8r'
  // db =  new Sequelize(postgreUri, {
  //   host: 'ec2-3-233-7-12.compute-1.amazonaws.com',
  //   dialect: 'postgres',
  //   pool: {
  //     max: 5,
  //     min: 0,
  //     idle: 10000
  //   },
  // });
  db =  new Sequelize(postgreUri, {
    // host: 'localhost',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // <<<<<<< YOU NEED THIS
      }
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
  });
  // db =  new Sequelize(postgreUri);


module.exports = db;