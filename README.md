# Lucky Hand

A small web app for real time lottery.

## Deploy

### Config

* Copy `config.example.js` to `config.js`

* Update your own configuration in `config.js`

* Run in `Node.js`

### Nginx configuration

```nginx
upstream lucky_socket_nodes {
  ip_hash;
  server 127.0.0.1:8088 weight=5;
}

server {
  listen 80;
  server_name example.com;

  root /b/lucky/public;
  index index.html;

  location / {
    proxy_pass http://127.0.0.1:8088;
  }

  location /scoket.io/ {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_pass http://lucky_socket_nodes;
  }

  location ~ /(js|css|images)/ {
    expires    3d;
  }

  location ~ /\.ht {
    deny  all;
  }
}
```
