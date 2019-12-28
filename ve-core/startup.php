<?php
ini_set('date.timezone', 'UTC');
ini_set('error_reporting', E_ALL);
ini_set('display_errors', '1');
ini_set('zlib.output_compression', 'On');
ini_set('zlib.output_compression_level', '-1');

if (version_compare(PHP_VERSION, 5.5) < 0) {
	exit('Current PHP version ' . PHP_VERSION . '. Need minimal version 5.5');
}
if (!function_exists('curl_init')) {
	exit('The need is cURL');
}
$gd = gd_info();
if (!$gd['PNG Support'] || !$gd['JPEG Support'] || !$gd['GIF Read Support'] || !$gd['GIF Create Support'] || !function_exists('imagealphablending') || !function_exists('imagesavealpha')) {
	exit('Current GD version ' . $gd['GD Version'] . '. Need minimal version 2.0.1 and support PNG, JPEG, GIF, imagealphablending, imagesavealpha.');
}
if (ini_get('register_globals')) {
	exit('PHP directive "register_globals" is enable. This poses a threat to security of the site.');
}
if (ini_get('magic_quotes_gpc')) {
	exit('PHP directive "magic_quotes_gpc" is enable. This poses a threat to security of the site.');
}

session_start();

require_once('class.Database.php');
require_once('class.Helpers.php');
require_once('class.Visitor.php');
require_once('class.Minify.php');
require_once('class.Cache.php');
require_once('class.Route.php');
require_once('class.Files.php');
require_once('class.Core.php');
require_once('class.Log.php');

$db      = new Database(DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PREFIX);
$helpers = new Helpers();
$visitor = new Visitor();
$core    = new Core();

$settings = $db->select('settings', '*', [], __FILE__, __LINE__);
$settings = array_column($settings, 'value', 'variable');
$constants = [];

if (URL_PROTOKOL === 'http' && !!$settings['httpsRewrite']) {
	header('Location: https://' . URL_SITE_SHORT . $_SERVER['REQUEST_URI'], true, 301);
	die;
}

$urls = str_replace('?' . $_SERVER['QUERY_STRING'], '', $_SERVER['REQUEST_URI']);
$urls = str_replace('//', '/', $urls . '/');
$urls = urldecode($urls);
$urls = explode('/', $urls);
array_shift($urls);
array_pop($urls);
$urls['isAjax'] = isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest' : false;
?>