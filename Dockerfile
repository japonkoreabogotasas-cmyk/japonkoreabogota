FROM php:8.2-apache

RUN a2enmod rewrite headers \
    && (a2dismod -f mpm_event mpm_worker || true) \
    && a2enmod mpm_prefork

# Permite usar .htaccess (rewrites, canonical, 404)
RUN sed -ri 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

WORKDIR /var/www/html

COPY . /var/www/html

EXPOSE 80

# Hace que Apache escuche el PORT inyectado por Railway (si existe)
CMD ["/bin/sh", "-c", "PORT_TO_LISTEN=${PORT:-80}; sed -ri \"s/Listen 80/Listen ${PORT_TO_LISTEN}/\" /etc/apache2/ports.conf; sed -ri \"s/:80>/:${PORT_TO_LISTEN}>/\" /etc/apache2/sites-available/000-default.conf; apache2-foreground"]
