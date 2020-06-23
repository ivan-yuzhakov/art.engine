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

	public function createTransaction($data = [])
	{
		$this->check();

		/*$data = [
			'intent' => 'sale',
			'payer' => [
				'payment_method' => 'credit_card',
				'funding_instruments' => [
					[
						'credit_card' => [
							'number' => '1111222233334444',
							'type' => '', //visa, mastercard, discover, amex.
							'expire_month' => 02,
							'expire_year' => 2020,
							'cvv2' => '111',
							'first_name' => 'Betsy',
							'last_name' => 'Buyer',
							'billing_address' => [
								'line1' => '111 First Street',
								'city' => 'Saratoga',
								'state' => 'CA',
								'postal_code' => '95070',
								'country_code' => 'US'
							]
						]
					]
				]
			],
			'transactions' => [
				[
					'amount' => [
						'total' => '0.01',
						'currency' => 'USD',
						'details' => [
							'subtotal' => '0.01',
							'tax' => '0',
							'shipping' => '0'
						]
					],
					'description' => 'The payment transaction description.'
				]
			]
		];*/

		$response = $this->request('POST', '/v1/payments/payment', $data);

		if (empty($response->name)) {
			return ['status' => 'OK', 'transaction' => $response->transactions[0]];
		} else {
			return ['status' => 'FAIL', 'error' => $response];
		}
	}
}

$plugin_stripe = new Plugin_stripe($plugin);
?>