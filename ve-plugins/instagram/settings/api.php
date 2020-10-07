<?php
class Plugin_instagram_settings
{
	public $id;
	public $status;
	public $show;
	public $alias;
	public $fields;

	public function __construct($plugin)
	{
		$this->id = $plugin['id'];
		$this->status = $plugin['status'];
		$this->show = $plugin['show'];
		$this->alias = $plugin['alias'];
		$this->fields = json_decode($plugin['fields'], true);
	}

	public function check()
	{
		global $db;

		if (!isset($this->fields['access_token']) || empty($this->fields['access_token']) || time() >= (int) @$this->fields['expires']) {
			$url = URL_SITE . 'plugin/instagram/auth';

			json(['status' => false, 'url' => 'https://api.instagram.com/oauth/authorize?client_id=' . $this->fields['app_id'] . '&redirect_uri=' . urlencode($url) . '&scope=user_profile,user_media&response_type=code']);
		}

		json(['status' => true]);
	}
}

$plugin_instagram_settings = new Plugin_instagram_settings($plugin);

if ($query === 'check') $plugin_instagram_settings->check();
?>