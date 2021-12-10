<?php
// setup plugins
$plugins = $db->select('plugins', '*', ['status' => 1], __FILE__, __LINE__);
foreach ($plugins as $plugin) {
	$path = DIR_PLUGINS . $plugin['alias'] . '/backend/api.php';
	if (file_exists($path)) require_once($path);
}

$get = explode('/', key($_GET));

$section = $get[0];
$query = $get[1];

require_once('api/common.php');
require_once('api/search.php');
require_once('api/database.php');
require_once('api/fields.php');
require_once('api/fields_groups.php');
require_once('api/files.php');
require_once('api/items.php');
require_once('api/members.php');
require_once('api/plugins.php');
require_once('api/settings.php');
require_once('api/sorting.php');
require_once('api/updates.php');
require_once('api/support.php');
//require_once('api/orders.php');
//require_once('api/statistics.php');
?>