<?php
class Plugin_square
{
	public $id;
	public $status;
	public $show;
	public $alias;
	public $fields;
	public $location_id;

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
		if ($this->status === 0)
			return ['status' => 'OK', 'error' => 'DISABLE_PLUGIN'];

		if (!isset($this->fields->app_id) || empty($this->fields->app_id))
			return ['status' => 'OK', 'error' => 'EMPTY_APP_ID'];

		if (!isset($this->fields->app_secret) || empty($this->fields->app_secret))
			return ['status' => 'OK', 'error' => 'EMPTY_APP_SECRET'];

		if (!isset($this->fields->auth))
			return ['status' => 'OK', 'error' => 'AUTH'];
	}

	private function request($method, $url, $data = [])
	{
		$host = 'https://connect.squareup.com';

		if ($method === 'POST') {
			$response = Unirest\Request::post($host . $url, [
				'Authorization' => 'Bearer ' . $this->fields->auth->access_token,
				'Accept' => 'application/json',
				'Content-Type' => 'application/json'
			], json_encode($data));
		}

		return $response->body;
	}

	public function setLocation($location_id)
	{
		$this->location_id = $location_id;
	}

	public function createCustomer($data)
	{
		$this->check();

		/*$data = [
			'given_name' => 'Amelia',
			'family_name' => 'Earhart',
			'email_address' => 'Amelia.Earhart@example.com',
			'address' => [
				'address_line_1' => '500 Electric Ave',
				'address_line_2' => 'Suite 600',
				'locality' => 'New York',
				'administrative_district_level_1' => 'NY',
				'postal_code' => '10003',
				'country' => 'US'
			],
			'phone_number' => '1-212-555-4240',
			'reference_id' => 'YOUR_REFERENCE_ID',
			'note' => 'donate'
		];*/

		$response = $this->request('POST', '/v2/customers', $data);

		if (empty($response->errors)) {
			return ['status' => 'OK', 'customer' => $response->customer];
		} else {
			return ['status' => 'FAIL', 'error' => $response->errors];
		}
	}

	public function createTransaction($data)
	{
		$this->check();

		/*$data = [
			'idempotency_key' => uniqid(),
			'shipping_address' => [
				'address_line_1' => '123 Main St',
				'locality' => 'San Francisco',
				'administrative_district_level_1' => 'CA',
				'postal_code' => '94114',
				'country' => 'US'
			],
			'billing_address' => [
				'address_line_1' => '500 Electric Ave',
				'address_line_2' => 'Suite 600',
				'administrative_district_level_1' => 'NY',
				'locality' => 'New York',
				'postal_code' => '10003',
				'country' => 'US'
			],
			'amount_money' => [
				'amount' => 5000,
				'currency' => 'USD'
			],
			'card_nonce' => 'card_nonce_from_square_123',
			'reference_id' => 'some optional reference id',
			'note' => 'some optional note',
			'delay_capture' => false
		];*/

		$response = $this->request('POST', '/v2/locations/' . $this->location_id . '/transactions', $data);

		if (empty($response->errors)) {
			return ['status' => 'OK', 'transaction' => $response->transaction];
		} else {
			return ['status' => 'FAIL', 'error' => $response->errors];
		}
	}
}

$plugin_square = new Plugin_square($plugin);
?>