<?php
require_once('settings.php');

require_once(DIR_CORE . 'startup.php');

$visitor->set_lang();
$core->route->routing();
?>