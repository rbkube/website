
FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY .well-known/matrix/server /usr/share/nginx/html/.well-known/matrix/server
COPY logo.gif /usr/share/nginx/html/logo.gif
COPY script.js /usr/share/nginx/html/script.js
COPY style.css /usr/share/nginx/html/style.css
EXPOSE 80
