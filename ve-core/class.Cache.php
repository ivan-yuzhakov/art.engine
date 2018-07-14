<?php
class Cache
{
	public function __construct()
	{
		if (!file_exists(DIR_CACHE)) mkdir(DIR_CACHE);
	}

	private function is_expired($expiration)
	{
		return (!$expiration || $expiration < time());
	}

	public function getCache($key = false)
	{
		global $visitor;

		if ($visitor->is_admin || !$key || !file_exists(DIR_CACHE . $key)) return false;

		$file = file_get_contents(DIR_CACHE . $key);
		$pos = strpos($file, "\n");
		$expiration = substr($file, 0, $pos);
		$data = substr($file, $pos + 1);

		if ($this->is_expired($expiration)) {
			return false;
		} else {
			return unserialize($data);
		}
	}

	public function setCache($key, $data = '', $expiration = false) //seconds
	{
		global $visitor, $settings, $helpers;

		if ($visitor->is_admin) return false;

		$data = serialize($data);

		$expired = false;
		if (is_numeric($expiration)) {
			$expired = $expiration + time();
		} else {
			$expired = strtotime($expiration);
			if (!$expired || $expired < time()) $expired = time() + ((int) $settings['cacheTime']);
		}

		$helpers->file_create(DIR_CACHE . $key, $expired . "\n" . $data);
	}

	public function deleteCache($key = false)
	{
		if ($key) @unlink(DIR_CACHE . $key);
	}

	public function clearCache($lock = false)
	{
		if ($lock === 'all') {
			array_map('unlink', glob(DIR_CACHE . '*'));
			return false;
		}
		if ($lock && !empty($lock)) {
			foreach (glob(DIR_CACHE . '*') as $file) {
				$info = pathinfo($file);
				$filename = $info['filename'];
				$pos = strrpos($filename, $lock);
				if ($pos === 0) @unlink($file);
			}
		}
	}
}
?>