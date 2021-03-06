const Sequelize = require('sequelize');
let db;
  const postgreUri = 'postgres://biohutpetsbuxn:81f6023d3ff26391a6b290ee7e8f906b9a6fea9ac23a16f7b16874a4cd05cec0@ec2-3-233-7-12.compute-1.amazonaws.com:5432/d8ghc7vsej2q8r'
  if (process.env.NODE_ENV === 'production') {
    db =  new Sequelize(postgreUri, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
    });
  } else {
    db =  new Sequelize("mediumcrawldb", "postgres", "9939105936", {
      host: 'localhost',
      dialect: 'postgres',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
    });
  }


module.exports = db;