
var config = require('./config');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var validator = require('validator');

var db = require('./src/db');
var Lucky = require('./src/lucky');

var lucky = new Lucky();

lucky.init(function (err) {
  if (err) {
    console.error(err);
    return;
  }
  server.listen(config['web'].port, config['web'].hostname);
  console.log('lucky server started!');
});

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
  socket.on('reset', function (data) {
    if (data && data.reset_key && data.reset_key === config['admin'].reset_key) {
      var d = data.data;
      var rd = [];
      if (d && d instanceof Array) {
        for (var i = 0; i < d.length; i++) {
          if (typeof d[i] === 'string') {
            d[i] = validator.trim(d[i]);
            if (d[i]) {
              rd.push(d[i]);
            }
          }
        }
      }
      if (rd.length <= 0) {
        console.error('data not vaild');
        return;
      } else {
        console.log('reset');
      }
      lucky.reset(rd, function (err) {
        if (err) {
          console.error(err);
          return;
        }
        // self & others
        socket.emit('reset');
        socket.broadcast.emit('reset');
      });
    }
  });
  socket.on('list', function () {
    if (!socket.name) {
      return;
    }
    lucky.list(function (err, data) {
      if (err) {
        socket.emit('error', err);
      } else {
        socket.emit('list', data);
      }
    });
  });
  socket.on('new', function () {
    if (!socket.name) {
      return;
    }
    console.log('new', socket.name);
    lucky.new(socket.name, function (err, data) {
      if (err) {
        socket.emit('error', err);
      } else {
        socket.emit('new', data);
        socket.broadcast.emit('new', data);
      }
    });
  });
  socket.on('error', function () {
  });
  socket.on('init', function (data) {
    var name = (data && data.name) ? validator.trim(data.name) : null;
    if (name) {
      socket.name = name;
    }
    lucky.list(function (err, data) {
      if (err) {
        socket.emit('error', err);
      } else {
        socket.emit('list', data);
      }
    });
    lucky.status(name, function (err, data) {
      if (err) {
        socket.emit('error', err);
      } else {
        socket.emit('status', data);
      }
    });
  });
  socket.on('avatar', function (avatar) {
    if (!socket.name || typeof avatar !== 'string') {
      return;
    }
    lucky.avatar(socket.name, avatar, function (err) {
      if (err) {
        socket.emit('error', err);
      }
    })
  });
});
