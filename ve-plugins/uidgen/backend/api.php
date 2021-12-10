<?php
class Plugin_uidgen
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

		// $this->public_key = @$this->fields->test_mode ? $this->fields->sandbox_public_key : $this->fields->public_key;
		// $this->private_key = @$this->fields->test_mode ? $this->fields->sandbox_private_key : $this->fields->private_key;
		// $this->access_token = @$this->fields->auth->access_token;
	}

	public function generate($id, $fields, $config)
	{
		global $db, $settings;

		if ($id === $this->fields->artist) {
			if (!isset($fields[$id]) || empty($fields[$id])) return false;

			$field = $fields[$id];
			
			$items = $db->select('items', ['fields'], ['id' => $field]);

			if (empty($items)) return false;
			
			$f = json_decode($items[0]['fields'], true)[$settings['langFrontDefault']][$this->fields->uid_field];

			if (empty($f)) return false;

			$n = '';
			$uid = $config['mask'] . $config['separate'] . $f . '-';
			$query = $db->query("SELECT `uid` FROM `ve_database` WHERE `uid` LIKE '%" . $uid . "%'");
			$arr = [];
			if ($query->num_rows > 0) {
				while ($row = $query->fetch_assoc()) {
					$arr[] = $row;
				}
			}
			$arr = array_column($arr, 'uid');
			$arr = str_replace($uid, "", $arr);
			rsort($arr);
			if (isset($arr[0])) {
				$n = (int) $arr[0] + 1;
			} else {
				$n = '1';
			}

			return $f . '-' . $n;
		} else {
			return false;
		}
	}
}

$plugin_uidgen = new Plugin_uidgen($plugin);
?>