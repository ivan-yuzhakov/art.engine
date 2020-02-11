<?php
define('VERSION', '0.0.13');
define('VERSION_THEME', '1');
define('SALT', 'saltstringforpassword:)');

define('MAIL_DEVELOPER_BACKEND', '79220771200@yandex.ru'); // For notifications kernel bug, admin panel bug
define('MAIL_DEVELOPER_FRONTEND', '79220771200@yandex.ru'); // For notifications of errors at the front

// DB
define('DB_HOST', 'localhost');
define('DB_NAME', 'art');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_PREFIX', 've_');

// DIR
define('DIR_SITE', dirname(__FILE__) . '/');
define('DIR_CORE', DIR_SITE . 've-core/');
define('DIR_CACHE', DIR_SITE . 've-cache/');
define('DIR_FILES', DIR_SITE . 've-files/');
define('DIR_THEME', DIR_SITE . 've-theme/');
define('DIR_PLUGINS', DIR_SITE . 've-plugins/');

// URL
define('URL_SITE_SHORT', $_SERVER['SERVER_NAME']);
define('URL_PROTOKOL', @$_SERVER['HTTPS'] === 'on' ? 'https' : 'http');
define('URL_SITE', URL_PROTOKOL . '://' . URL_SITE_SHORT . '/');
define('URL_CACHE', URL_SITE . 've-cache/');
define('URL_FILES', URL_SITE . 've-files/');
define('URL_THEME', URL_SITE . 've-theme/');
define('URL_PLUGINS', URL_SITE . 've-plugins/');
?>