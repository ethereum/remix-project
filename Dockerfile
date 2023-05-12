terrareal FROM nginx:alpine
WORKDIR /cripto 

COPY ./temp_publish_docker/ /usr/share/nginx/html/

EXPOSE 80
auto create 