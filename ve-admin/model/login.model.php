<?php
if (isset($_GET['logout'])) {
	$visitor->logout();
	header('Location: ' . URL_SITE . 've-admin/');
	die;
}

$admin_lang = isset($_COOKIE['ADMIN_LANG']) ? $_COOKIE['ADMIN_LANG'] : 'eng';
if (!file_exists('language/' . $admin_lang . '.php')) {
	setcookie('ADMIN_LANG', 'eng', time() + 60*60*24*30);
	header('Location: ' . URL_SITE . 've-admin/');
	die;
}

if (!$visitor->is_logged) {
	if (isset($_POST['lang']) && file_exists('language/' . $_POST['lang'] . '.php')) {
		setcookie('ADMIN_LANG', $admin_lang = $_POST['lang'], time() + 60*60*24*30);
	}

	if ($urls['isAjax']) {
		die('AUTH_FAIL');
	} else {
		if (isset($_POST['login']) && isset($_POST['password'])) {
			$success = $visitor->login($_POST['login'], $_POST['password']);
			if ($success) {
				header('Location: ' . URL_SITE . 've-admin/');
			} else {
				$error = 'Wrong login or password';
				require_once('login.template.php');
			}
		} else {
			$error = false;
			require_once('login.template.php');
		}
	}
	die;
}
?>