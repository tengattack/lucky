
var config = require('./../config'),
    MongoClient = require('mongodb'),
    ObjectID = MongoClient.ObjectID;

var reg = function (col, callback) {
  var authStr = '';
  if (!config['db'] || !config['db']['name']) {
    return callback(new Error('not found db config'));
  }

  if (config['db']['username'] && config['db']['password']) {
    authStr = config['db']['username'] + ':' + config['db']['password'] + '@';
  }

  MongoClient.connect('mongodb://' + authStr + config['db']['host'] + '/' + config['db']['name'], {w: 1}, function (err, db) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    callback(null, db.collection(col));
  });
}

exports.collection = reg;
