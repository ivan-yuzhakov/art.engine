<?php
require_once('../settings.php');
require_once(DIR_CORE . 'startup.php');

require_once('model/login.model.php');

require_once('language/eng.php');
if ($admin_lang && file_exists('language/' . $admin_lang . '.php')) {
	require_once('language/' . $admin_lang . '.php');
}

if (!empty($_GET)) {
	require_once('api.php');
	die;
} else {
	require_once('model/index.model.php');
	require_once('index.template.php');
}
?>