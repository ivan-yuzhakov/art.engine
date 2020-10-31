<?php
class Plugin_instagram
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
		$this->fields = json_decode($plugin['fields'], true);
	}

	public function check()
	{
		if ($this->status === 0) return false;

		return $this->refresh();
	}

	public function getFeed($count = 10, $cache_minutes = 720)
	{
		global $core;

		$status = $this->check();

		if (!$status) return ['data' => []];

		$key = 'instagram_feed_' . $count;
		$cache = $core->cache->getCache($key);
		if ($cache) {
			return $cache;
		} else {
			$response = Unirest\Request::get('https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=' . $this->fields['access_token'], []);

			if (isset($response->body->data)) {
				$data = array_slice($response->body->data, 0, $count);
				$data = array_map(function($d){
					return (array) $d;
				}, $data);

				$core->cache->setCache($key, ['data' => $data], $cache_minutes * 60);

				return ['data' => $data];
			} else {
				return ['data' => []];
			}
		}
	}

	private function refresh()
	{
		global $db, $helpers;

		if (!isset($this->fields['expires'])) return false;
		if ($this->fields['expires'] <= time()) return false;
		if (!isset($this->fields['access_token'])) return false;
		if (empty($this->fields['access_token'])) return false;

		if (time() >= $this->fields['expires'] - 20*24*60*60) {
			$response = Unirest\Request::get('https://graph.instagram.com/refresh_access_token?access_token=' . $this->fields['access_token'] . '&grant_type=ig_refresh_token', []);

			$access_token_long = @$response->body->access_token;
			$expires = @$response->body->expires_in;

			if (!$access_token_long) {
				$helpers->mail(MAIL_DEVELOPER_BACKEND, URL_SITE_SHORT . ' - Error plugin instagram!', json_encode($response->body));
				return false;
			}

			$this->fields['access_token'] = $access_token_long;
			$this->fields['expires'] = time() + $expires;

			$db->update('plugins', [
				'fields' => json_encode($this->fields)
			], 'id', $this->id);
		}

		return true;
	}
}

$plugin_instagram = new Plugin_instagram($plugin);
?>