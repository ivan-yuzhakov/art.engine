<?php
class Plugin_stripe
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

		$this->public_key = @$this->fields->test_mode ? $this->fields->sandbox_public_key : $this->fields->public_key;
		$this->private_key = @$this->fields->test_mode ? $this->fields->sandbox_private_key : $this->fields->private_key;
		$this->access_token = @$this->fields->auth->access_token;
	}

	private function check()
	{
		if ($this->status === 0)
			return ['status' => 'OK', 'error' => 'DISABLE_PLUGIN'];

		if (!isset($this->public_key) || empty($this->public_key))
			return ['status' => 'OK', 'error' => 'EMPTY_APP_ID'];

		if (!isset($this->private_key) || empty($this->private_key))
			return ['status' => 'OK', 'error' => 'EMPTY_APP_SECRET'];

		if (!isset($this->fields->auth))
			return ['status' => 'OK', 'error' => 'AUTH'];

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
				return ['status' => 'OK', 'error' => 'AUTH_FAIL'];
			}
		}
	}

	private function request($method, $url, $data = [])
	{
		if ($method === 'POST') {
			$response = Unirest\Request::post($this->host . $url, [
				'Authorization' => 'Bearer ' . $this->access_token,
				'PayPal-Partner-Attribution-Id' => 'Mind_SP',
				'Content-Type' => 'application/json'
			], Unirest\Request\Body::json($data));
		}

		return $response->body;
	}

	public function get_clientSecret($amount, $email = false)
	{
		\Stripe\Stripe::setApiKey($this->private_key);

		$arr = [
			'amount' => $amount, // cent, min 50
			'currency' => 'usd',
			'metadata' => ['integration_check' => 'accept_a_payment']
		];
		if ($email) $arr['receipt_email'] = $email;

		$intent = \Stripe\PaymentIntent::create($arr);

		return $intent;
	}
}

$plugin_stripe = new Plugin_stripe($plugin);
?>