<?php
class Plugin_paypal_page
{
	public $id;
	public $status;
	public $show;
	public $alias;
	public $fields;

	public $host = 'https://api.paypal.com';
	public $client_id;
	public $client_secret;
	public $access_token;

	public function __construct($plugin)
	{
		$this->id = $plugin['id'];
		$this->status = $plugin['status'];
		$this->show = $plugin['show'];
		$this->alias = $plugin['alias'];
		$this->fields = json_decode($plugin['fields']);

		$this->client_id = $this->fields->test_mode ? $this->fields->client_id_sandbox : $this->fields->client_id;
		$this->client_secret = $this->fields->test_mode ? $this->fields->client_secret_sandbox : $this->fields->client_secret;
		$this->access_token = @$this->fields->auth->access_token;
	}

	private function check()
	{
		if ($this->status === 0)
			json(['status' => 'DISABLE_PLUGIN']);

		if (!isset($this->client_id) || empty($this->client_id))
			json(['status' => 'EMPTY_CLIENT_ID']);

		if (!isset($this->client_secret) || empty($this->client_secret))
			json(['status' => 'EMPTY_CLIENT_SECRET']);

		$this->renew_token();
	}

	private function renew_token()
	{
		global $db;

		$expires = isset($this->fields->auth) ? $this->fields->auth->expires_in <= time() : true;

		if ($expires) {
			require_once(DIR_CORE . 'library/Unirest.php');

			$response = Unirest\Request::post($this->host . '/v1/oauth2/token', [
				'Accept' => 'application/json',
				'Accept-Language' => 'en_US',
				'Content-Type' => 'application/x-www-form-urlencoded'
			], Unirest\Request\Body::form([
				'grant_type' => 'client_credentials'
			]), $this->client_id, $this->client_secret);

			if (property_exists($response->body, 'access_token')) {
				$fields = (array) $this->fields;
				$fields['auth'] = (array) $response->body;
				$fields['auth']['expires_in'] += time();

				$db->update('plugins', [
					'fields' => json_encode($fields)
				], 'id', $this->id, __FILE__, __LINE__);

				$this->access_token = $response->body->access_token;
			} else {
				json(['status' => 'AUTH_FAIL']);
			}
		}
	}

	private function request($method, $url)
	{
		require_once(DIR_CORE . 'library/Unirest.php');

		if ($method === 'GET') {
			$response = Unirest\Request::get($this->host . $url, [
				'Authorization' => 'Bearer ' . $this->access_token,
				'Content-Type' => 'application/json'
			]);
		}

		return $response->body;
	}

	public function get_list()
	{
		$this->check();

		$section = $_POST['section'];

		if ($section === 'payments') {
			$response = $this->request('GET', '/v1/payments/payment');

			$count = $response->count;
			$list = $response->payments;
		}

		if ($count === 0) {
			json(['status' => 'EMPTY']);
		} else {
			json(['status' => 'OK', 'list' => $list]);
		}
	}
}

$plugin_paypal_page = new Plugin_paypal_page($plugin);

if ($query === 'get_list') $plugin_paypal_page->get_list();
?>