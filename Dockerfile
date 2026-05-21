FROM php:8.2-apache

RUN a2enmod rewrite headers \
    && (a2dismod -f mpm_event mpm_worker || true) \
    && a2enmod mpm_prefork

# Permite usar .htaccess (rewrites, canonical, 404)
RUN sed -ri 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

WORKDIR /var/www/html

COPY . /var/www/html

EXPOSE 80

# Fuerza un solo MPM y ajusta puerto antes de iniciar Apache (Railway)
CMD ["bash", "-lc", "set -eux; a2dismod -f mpm_event mpm_worker || true; rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* || true; a2enmod mpm_prefork; PORT_TO_LISTEN=${PORT:-80}; sed -ri \"s/Listen 80/Listen ${PORT_TO_LISTEN}/\" /etc/apache2/ports.conf; sed -ri \"s/:80>/:${PORT_TO_LISTEN}>/\" /etc/apache2/sites-available/000-default.conf; apache2ctl -t; exec apache2-foreground"]
