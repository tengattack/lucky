
var db = require('./db');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function Lucky() {
  
}

Lucky.prototype.init = function (cb) {
  var that = this;
  db.collection('lucky', function (err, collection) {
    if (!err) {
      that.collection = collection;
      that.ensureIndex();
    }
    cb(err);
  });
};

Lucky.prototype.ensureIndex = function (cb) {
  var count = 0;
  var lasterr = null;
  
  var fake_cb = function (err) {
    count++;
    if (err) lasterr = err;
    if (count >= 3 && cb) {
      cb(lasterr);
    }
  }
  
  this.collection.ensureIndex({ name: 1 }, { background: true, w: 1 }, fake_cb);
  this.collection.ensureIndex({ lid: 1 }, { background: true, w: 1 }, fake_cb);
  this.collection.ensureIndex({ updated_at: -1 }, { background: true, w: 1 }, fake_cb);
};

Lucky.prototype.pushData = function (data, cb) {
  var count = 0;
  var lasterr = null;

  var fake_cb = function (err) {
    count++;
    if (err) lasterr = err;
    if (count >= data.length && cb) {
      cb(lasterr);
    }
  }
  
  for (var i = 0; i < data.length; i++) {
    this.collection.insert({
      lid: i + 1,
      name: '',
      value: data[i],
      updated_at: Date.now()
    }, fake_cb);
  }
};

Lucky.prototype.reset = function (data, cb) {
  var that = this;
  this.collection.drop(function (err, d) {
    if (err) {
      return cb(err, d);
    }
    that.ensureIndex(function () {
      that.pushData(data, cb);
    });
  });
};

Lucky.prototype.list = function (cb) {
  this.collection.find({ name: { $ne: '' } }).sort({updated_at: -1}).toArray(cb);
};

Lucky.prototype.getLast = function (cb) {
  this.collection.find({ name: '' }).toArray(cb);
};

Lucky.prototype.new = function (name, cb) {
  var that = this;
  this.status(name, function (err) {
    if (err) {
      return cb(err);
    }
    that.getLast(function (err, data) {
      if (err) {
        return cb(err);
      }
      if (data.length <= 0) {
        return cb('no new');
      }
      
      var i = getRandomInt(0, data.length);
      var sel_data = data[i];
      sel_data.name = name;
      sel_data.updated_at = Date.now();
      that.collection.update({ _id: sel_data._id },
          { $set: { name: sel_data.name, updated_at: sel_data.updated_at } },
          function (err, d) {
        if (err) {
          return cb(err);
        }
        cb(null, sel_data);
      });
    });
  });
};

Lucky.prototype.status = function (name, cb) {
  if (!name) {
    return cb('no name');
  }
  this.collection.findOne({ name: name }, cb);
};

module.exports = Lucky;
