FROM nginx:1.11

ENV http_proxy http://10.78.17.6:3128
ENV https_proxy http://10.78.17.6:3128

COPY ./hosts /etc/nginx/conf.d
COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]