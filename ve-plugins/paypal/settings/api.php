<?php
class Plugin_paypal_settings
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
			header('Location: /ve-admin/#/plugins/paypal');
			die;
		}

		if (!isset($this->fields->client_id) || empty($this->fields->client_id)) {
			header('Location: /ve-admin/#/plugins/paypal');
			die;
		}

		if (!isset($this->fields->client_secret) || empty($this->fields->client_secret)) {
			header('Location: /ve-admin/#/plugins/paypal');
			die;
		}
	}
}

$plugin_paypal_settings = new Plugin_paypal_settings($plugin);
?>