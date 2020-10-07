<?php
class Plugin
{
	public $id;
	public $status;
	public $show;
	public $alias;
	public $fields;

	public function __construct($plugin)
	{
		global $urls;

		$this->id = $plugin['id'];
		$this->status = $plugin['status'];
		$this->show = $plugin['show'];
		$this->alias = $plugin['alias'];
		$this->fields = json_decode($plugin['fields'], true);

		if (@$urls[2] === 'auth') $this->auth();
		if (@$urls[2] === 'logout') $this->logout();
	}

	private function auth()
	{
		global $db, $helpers;

		$code = @$_GET['code'];

		if (!$code) {
			$helpers->mail(MAIL_DEVELOPER_BACKEND, URL_SITE_SHORT . ' - Error plugin instagram!', json_encode($_GET));
			die('Auth error. Close this window and try again.');
		}

		// code -> access_token
		$response = Unirest\Request::post('https://api.instagram.com/oauth/access_token', [], Unirest\Request\Body::form([
			'client_id' => $this->fields['app_id'],
			'client_secret' => $this->fields['app_secret'],
			'code' => $code,
			'grant_type' => 'authorization_code',
			'redirect_uri' => URL_SITE . 'plugin/instagram/auth'
		]));

		$access_token = @$response->body->access_token;

		if (!$access_token) {
			$helpers->mail(MAIL_DEVELOPER_BACKEND, URL_SITE_SHORT . ' - Error plugin instagram!', json_encode($response->body));
			die('Auth error. Close this window and try again.');
		}

		// access_token -> long access_token
		$response = Unirest\Request::get('https://graph.instagram.com/access_token?access_token=' . $access_token . '&client_secret=' . $this->fields['app_secret'] . '&grant_type=ig_exchange_token', []);

		$access_token_long = @$response->body->access_token;
		$expires = @$response->body->expires_in;

		if (!$access_token_long) {
			$helpers->mail(MAIL_DEVELOPER_BACKEND, URL_SITE_SHORT . ' - Error plugin instagram!', json_encode($response->body));
			die('Auth error. Close this window and try again.');
		}

		$this->fields['access_token'] = $access_token_long;
		$this->fields['expires'] = time() + $expires;

		$db->update('plugins', [
			'fields' => json_encode($this->fields)
		], 'id', $this->id);

		die('You may close this window and refresh the previous workspace!');
	}

	private function logout()
	{
		global $db;

		json(['status' => true]);
	}
}
?>