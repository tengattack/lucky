
moment.locale('zh-CN');

var socket = io('/');
var myname = localStorage.getItem('lucky_myname');

socket.on('connect', function () {
  // on connect
  if (myname) {
    init_socket();
  }
});
socket.on('status', function (data) {
  // list all
  if (data && data.me && data.me.value) {
    updateMyValue(data.me.value);
  } else {
    showGetter();
  }
  if (data && data.finished) {
    showFinished();
  }
});
socket.on('list', function (data) {
  // list all
  for (var i = data.length - 1; i >= 0; i--) {
    addToList(data[i]);
  }
});
socket.on('new', function (data) {
  // check if myself
  if (data && data.name === myname) {
    updateMyValue(data.value);
  }
  // add
  addToList(data);
});
socket.on('reset', function () {
  // remove all
  $('.posts-list').html('');
  showGetter();
});

function htmlEscape(str) {
  return String(str)
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
}
function init_socket() {
  if (myname) {
    socket.emit('init', { name: myname });
  }
}
function updateMyName(name) {
  if (!myname) {
    localStorage.setItem('lucky_myname', name);
    myname = name;
    init_socket();
  }
}
function updateMyValue(value) {
  $('.controls > .control').hide();
  $('.valuer #myvalue').text(value);
  $('.valuer').show();
}
function showGetter() {
  $('.controls > .control').hide();
  $('.getter').show();
}
function showInputter() {
  $('.controls > .control').hide();
  $('.inputer').show();
}
function showFinished() {
  $('.controls > .control').hide();
  $('.finisher').show();
}
function addToList(data) {
  /*$('.posts-list').prepend('<li class="value">'
    + '<span class="lid">' + data.lid.toString() + '</span>'
    + '<span class="name">' + htmlEscape(data.name) + '</span>'
    + '<span class="value">' + data.value.toString() + '</span>'
    + '</li>');*/
  var colors = ['#F44336', '#E91E63', '#2196F3', '#4CAF50', '#FF9800', '#FF5722', '#607D8B'];
  var lid = data.lid.toString();
  var selector = (data.name === myname ? '#my-value-list' : '#others-value-list');
  if ($(selector + '.posts-list li[data-lid=' + lid + ']').length > 0) {
    // exists
    return;
  }
  //'#e65100'
  var color = colors[data.name.charCodeAt(0) % colors.length];
  var name = htmlEscape(data.name);
  var html = ''
    + '<li component="post" class="posts-list-item row" data-lid="' + lid + '" >'
    + '<div class="col-lg-11 col-sm-10 col-xs-9 post-body">'
		+ '	<div component="post/content" class="content">'
	  + '   <span class="lid" >' + lid + '</span>'
    + '   <span class="value">' + data.value.toString() + '</span>'
		+ '	</div>'
		+ '	<div class="post-info">'
		+ '		<a href="#">'
		+ '				<div class="user-icon user-img" style="background-color: ' + color + ';" title="" data-original-title="' + name + '">' + name[0] + '</div>'
		+ '		</a>'
		+ '		<div class="post-author">'
		+ '			<a href="#">' + name + '</a><br>'
		+ '			<span class="timeago" title="' + data.updated_at.toString() + '">' + moment(data.updated_at).fromNow() + '</span>'
		+ '		</div>'
		+ '	</div>'
		+ '</div>'
    + '</li>';
  $(selector + '.posts-list').prepend(html);
}

$(document).ready(function () {
  // for admin
  if (window.location.hash === '#reset') {
    $('.reseter').removeClass('control').show();
  }
  $('.reseter #reset-btn').click(function () {
    var vals = $('.reseter #reset-data').val();
    if (vals) vals = vals.split(' ');
    if (vals && vals.length > 0) {
      var data = [];
      for (var i = 0; i < vals.length; i++) {
        var s = vals[i].trim();
        if (s) data.push(s);
      }
      if (data.length > 0) {
        var rkey = prompt('请输入重置密码：');
        if (rkey) {
          socket.emit('reset', { reset_key: rkey, data: data });
          $('.reseter').addClass('control');
        }
      }
    }
  });
  $('.getter #get-btn').click(function () {
    if (confirm('准备好了么？')) {
      socket.emit('new');
    }
  });
  $('.inputer #myname-btn').click(function () {
    var name = $('.inputer #myname').val();
    if (name) {
      updateMyName(name);
    }
  });
  if (myname) {
    showGetter();
  } else {
    showInputter();
  }
});
