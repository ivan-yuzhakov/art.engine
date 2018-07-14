<?php
$get = explode('/', key($_GET));

$section = $get[0];
$query = $get[1];

require_once(DIR_CORE . 'api_backend/search.php');
require_once(DIR_CORE . 'api_backend/fields.php');
require_once(DIR_CORE . 'api_backend/fields_groups.php');
require_once(DIR_CORE . 'api_backend/files.php');
require_once(DIR_CORE . 'api_backend/items.php');
require_once(DIR_CORE . 'api_backend/members.php');
require_once(DIR_CORE . 'api_backend/plugins.php');
require_once(DIR_CORE . 'api_backend/settings.php');
require_once(DIR_CORE . 'api_backend/sorting.php');
require_once(DIR_CORE . 'api_backend/updates.php');
//require_once(DIR_CORE . 'api_backend/orders.php');
//require_once(DIR_CORE . 'api_backend/statistics.php');
?>