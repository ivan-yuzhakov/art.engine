<?php
class Plugin_stripe_settings
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
			header('Location: /ve-admin/#/plugins/stripe');
			die;
		}

		if (!isset($this->fields->public_key) || empty($this->fields->public_key)) {
			header('Location: /ve-admin/#/plugins/stripe');
			die;
		}

		if (!isset($this->fields->private_key) || empty($this->fields->private_key)) {
			header('Location: /ve-admin/#/plugins/stripe');
			die;
		}
	}
}

$plugin_stripe_settings = new Plugin_stripe_settings($plugin);
?>