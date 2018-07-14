<?php
class Instagram
{
	private $access_token = false;

	public function __construct($access_token = false)
	{
		$this->access_token = $access_token;
	}

	private function fetch($url)
	{
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_TIMEOUT, 20);
		$result = curl_exec($ch);
		curl_close($ch);

		return $result;
	}

	public function get_user($username)
	{
		if (empty($username)) return 'User name is empty';
		if (empty($this->access_token)) return 'Instagram Access Token is empty';

		$response = $this->fetch('https://api.instagram.com/v1/users/search?q=' . $username . '&access_token=' . $this->access_token);
		//dp('https://api.instagram.com/v1/users/search?q=' . $username . '&access_token=' . $this->access_token);
		$user_info = json_decode($response, true);

		return (int) @$user_info['data'][0]['id'];
	}

	public function get_feed($user_id = false, $count = 10)
	{
		if (empty($user_id)) return 'User id is empty';
		if (empty($this->access_token)) return 'Instagram Access Token is empty';

		$response = $this->fetch('https://api.instagram.com/v1/users/' . $user_id . '/media/recent?count=' . $count . '&access_token=' . $this->access_token);
		$feed = json_decode($response, true);

		return $feed['data'];
	}
}
?>