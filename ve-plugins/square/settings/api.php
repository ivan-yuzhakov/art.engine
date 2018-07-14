<?php
class Plugin_square_settings
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
		$this->fields = json_decode($plugin['fields']);
	}

	private function check()
	{
		if ($this->status === 0) {
			header('Location: /ve-admin/#/plugins/square');
			die;
		}

		if (!isset($this->fields->app_id) || empty($this->fields->app_id)) {
			header('Location: /ve-admin/#/plugins/square');
			die;
		}

		if (!isset($this->fields->app_secret) || empty($this->fields->app_secret)) {
			header('Location: /ve-admin/#/plugins/square');
			die;
		}
	}

	public function auth()
	{
		global $cl_query;

		$this->check();

		$code = isset($_GET['code']) ? $_GET['code'] : false;

		if ($code) {
			require_once(DIR_CORE . 'library/Unirest.php');

			$response = Unirest\Request::post('https://connect.squareup.com/oauth2/token', [
				'Authorization' => 'Client ' . $this->fields->app_secret,
				'Accept' => 'application/json',
				'Content-Type' => 'application/json'
			], json_encode([
				'client_id' => $this->fields->app_id,
				'client_secret' => $this->fields->app_secret,
				'code' => $code
			]));

			if (property_exists($response->body, 'access_token')) {
				$auth = [
					'access_token' => $response->body->access_token,
					'token_type'   => $response->body->token_type,
					'expires_at'   => $response->body->expires_at,
					'merchant_id'  => $response->body->merchant_id
				];

				$fields = (array) $this->fields;
				$fields['auth'] = $auth;

				$cl_query->editItem('plugins', [
					'fields' => json_encode($fields)
				], 'id', $this->id);

				header('Location: /ve-admin/#/plugins/square');
				die;
			} else {
				header('Location: /ve-admin/#/plugins/square');
				die;
			}
		} else {
			header('Location: /ve-admin/#/plugins/square');
			die;
		}
	}
}

$plugin_square_settings = new Plugin_square_settings($plugin);

if ($query === 'auth') $plugin_square_settings->auth();
?>