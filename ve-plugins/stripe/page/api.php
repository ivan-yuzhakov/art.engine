<?php
class Plugin_stripe_page
{
	public $id;
	public $status;
	public $show;
	public $alias;
	public $fields;

	public $host = 'https://api.stripe.com';
	public $public_key;
	public $private_key;
	public $access_token;

	public function __construct($plugin)
	{
		$this->id = $plugin['id'];
		$this->status = $plugin['status'];
		$this->show = $plugin['show'];
		$this->alias = $plugin['alias'];
		$this->fields = json_decode($plugin['fields']);

		$this->public_key = $this->fields->test_mode ? $this->fields->sandbox_public_key : $this->fields->public_key;
		$this->private_key = $this->fields->test_mode ? $this->fields->sandbox_private_key : $this->fields->private_key;
		$this->access_token = @$this->fields->auth->access_token;
	}

	private function check()
	{
		if ($this->status === 0)
			json(['status' => 'DISABLE_PLUGIN']);

		if (!isset($this->public_key) || empty($this->public_key))
			json(['status' => 'EMPTY_PUBLIC_KEY']);

		if (!isset($this->private_key) || empty($this->private_key))
			json(['status' => 'EMPTY_PRIVATE_KEY']);

		$this->renew_token();
	}

	private function renew_token()
	{
		global $db;

		$expires = isset($this->fields->auth) ? $this->fields->auth->expires_in <= time() : true;

		if ($expires) {
			$response = Unirest\Request::post($this->host . '/v1/oauth2/token', [
				'Accept' => 'application/json',
				'Accept-Language' => 'en_US',
				'Content-Type' => 'application/x-www-form-urlencoded'
			], Unirest\Request\Body::form([
				'grant_type' => 'client_credentials'
			]), $this->public_key, $this->private_key);

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

$plugin_stripe_page = new Plugin_stripe_page($plugin);

if ($query === 'get_list') $plugin_stripe_page->get_list();
?>