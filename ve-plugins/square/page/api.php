<?php
class Plugin_square_page
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
		if ($this->status === 0)
			json(['status' => 'DISABLE_PLUGIN']);

		if (!isset($this->fields->app_id) || empty($this->fields->app_id))
			json(['status' => 'EMPTY_APP_ID']);

		if (!isset($this->fields->app_secret) || empty($this->fields->app_secret))
			json(['status' => 'EMPTY_APP_SECRET']);

		if (!isset($this->fields->auth))
			json(['status' => 'AUTH', 'link' => 'https://connect.squareup.com/oauth2/authorize?client_id=' . $this->fields->app_id . '&scope=MERCHANT_PROFILE_READ%20PAYMENTS_READ%20PAYMENTS_WRITE%20ITEMS_READ%20ITEMS_WRITE%20CUSTOMERS_READ%20CUSTOMERS_WRITE%20ORDERS_READ%20ORDERS_WRITE&session=false']);

		$this->renew_token();
	}

	private function renew_token()
	{
		global $cl_query;

		$expires = strtotime($this->fields->auth->expires_at) - 14 * 24 * 60 * 60 < time();

		if ($expires) {
			require_once(DIR_CORE . 'library/Unirest.php');

			$response = Unirest\Request::post('https://connect.squareup.com/oauth2/clients/' . $this->fields->app_id . '/access-token/renew', [
				'Authorization' => 'Client ' . $this->fields->app_secret,
				'Accept' => 'application/json',
				'Content-Type' => 'application/json'
			], json_encode([
				'access_token' => $this->fields->auth->access_token
			]));

			if (property_exists($response->body, 'access_token')) {
				$this->fields->auth->access_token = $response->body->access_token;
				$this->fields->auth->token_type = $response->body->token_type;
				$this->fields->auth->expires_at = $response->body->expires_at;
				$this->fields->auth->merchant_id = $response->body->merchant_id;

				$fields = (array) $this->fields;
				$fields['auth'] = (array) $this->fields->auth;

				$cl_query->editItem('plugins', [
					'fields' => json_encode($fields)
				], 'id', $this->id);
			}
		}
	}

	private function request($method, $url)
	{
		$host = 'https://connect.squareup.com';

		require_once(DIR_CORE . 'library/Unirest.php');

		if ($method === 'GET') {
			$response = Unirest\Request::get($host . $url, [
				'Authorization' => 'Bearer ' . $this->fields->auth->access_token,
				'Accept' => 'application/json',
				'Content-Type' => 'application/json'
			]);
		}

		return $response->body;
	}

	public function get_locations()
	{
		$this->check();

		$response = $this->request('GET', '/v2/locations');

		$locations = $response->locations;
		$locations = array_map(function($location){
			return [
				'id' => $location->id,
				'name' => $location->name,
				'address' => (array) $location->address
			];
		}, $locations);

		if (empty($locations)) {
			json(['status' => 'LOCATIONS_EMPTY']);
		} else {
			json(['status' => 'OK', 'locations' => $locations]);
		}
	}

	public function get_list()
	{
		$this->check();

		$location = $_POST['location'];
		$section = $_POST['section'];

		if ($section === 'payments') {
			$response = $this->request('GET', '/v2/locations/' . $location . '/transactions');

			$list = $response->transactions;
		}
		if ($section === 'customers') {
			$response = $this->request('GET', '/v2/customers');

			$list = $response->customers;
		}
		if ($section === 'items') {
			$response = $this->request('GET', '/v1/' . $location . '/items');

			$list = $response;
		}
		if ($section === 'orders') {
			$response = $this->request('GET', '/v1/' . $location . '/orders');

			$list = $response;
		}

		if (empty($list)) {
			json(['status' => 'EMPTY']);
		} else {
			json(['status' => 'OK', 'list' => $list]);
		}
	}
}

$plugin_square_page = new Plugin_square_page($plugin);

if ($query === 'get_locations') $plugin_square_page->get_locations();
if ($query === 'get_list') $plugin_square_page->get_list();
?>