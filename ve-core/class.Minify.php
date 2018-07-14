<?php
class Minify
{
	public function file($type, $file)
	{
		global $visitor, $helpers;

		if (is_array($file)) return URL_THEME . $file[0] . '?' . VERSION_THEME;
		if ($visitor->is_admin) return URL_THEME . $file . '?' . VERSION_THEME;

		$key = implode('_', [$type, VERSION_THEME, str_replace('/', '.', $file)]);

		if (!file_exists(DIR_CACHE . $key)) {
			$cache = '';
			if ($type === 'js') $cache = $this->JS($file);
			if ($type === 'css') $cache = $this->CSS($file);

			if ($cache === false) {
				return URL_THEME . $file . '?' . VERSION_THEME;
			} else {
				$helpers->file_create(DIR_CACHE . $key, $cache);
			}
		}

		return URL_CACHE . $key;
	}

	public function HTML($html)
	{
		$search = [
			'/\>[^\S ]+/s', // strip whitespaces after tags, except space
			'/[^\S ]+\</s', // strip whitespaces before tags, except space
			'/(\s)+/s'      // shorten multiple whitespace sequences
		];
		$replace = [
			'>',
			'<',
			'\\1'
		];
		return preg_replace($search, $replace, $html);
	}

	public function CSS($file)
	{
		$css = file_get_contents(DIR_THEME . $file);

		// replace path to image
		$info = pathinfo($file);
		$dir = $info['dirname'] === '.' ? '' : '/' . $info['dirname'];
		$path = explode('/', '/ve-theme' . $dir);

		$css = preg_replace_callback('/url\((.+)\)/', function($matches) use ($path){
			$str = $matches[1];
			$quot = substr($str, 0, 1);

			if ($quot === '"' || $quot === '\'') {
				$str = substr($str, 1, -1);
			} else {
				$quot = false;
			}

			if (strpos($str, 'https://') === 0) {
				
			} else if (strpos($str, 'http://') === 0) {
				
			} else if (strpos($str, '//') === 0) {
				
			} else if (strpos($str, 'data:image') === 0) {
				
			} else if (strpos($str, '/') === 0) {
				
			} else if (strpos($str, '#') === 0) {
				
			} else if (strpos($str, '../') === 0) {
				array_pop($path);
				$str = implode('/', $path) . '/' . substr($str, 3);
			} else {
				$str = implode('/', $path) . '/' . $str;
			}

			return 'url(' . ($quot === false ? $str : $quot . $str . $quot) . ')';
		}, $css);

		// minify
		$ch = curl_init('https://cssminifier.com/raw');

		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['input' => $css]));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		$minified = curl_exec($ch);
		$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

		curl_close($ch);

		return ($code === 200 ? $minified : false);
	}

	public function JS($file)
	{
		global $helpers;

		require_once(DIR_CORE . 'library/Unirest.php');

		$body = Unirest\Request\Body::form([
			'code_url' => URL_THEME . $file,
			'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
			'output_format' => 'json'
		]);
		$body .= '&output_info=compiled_code';
		$body .= '&output_info=warnings';
		$body .= '&output_info=errors';

		$response = Unirest\Request::post('https://closure-compiler.appspot.com/compile', [], $body);

		if (isset($response->body->errors)) {
			$message = [
				'<p><b>File:</b> ' . URL_THEME . $file . '</p>'
			];
			foreach ($response->body->errors as $error) {
				$message[] = '<p><b>Error:</b> ' . json_encode($error) . '</p>';
			}
			$helpers->mail('', MAIL_DEVELOPER_FRONTEND, 'Error minify JS', implode('', $message));

			return false;
		}

		if (isset($response->body->warnings)) {
			$message = [
				'<p><b>File:</b> ' . URL_THEME . $file . '</p>'
			];
			foreach ($response->body->warnings as $warning) {
				$message[] = '<p><b>Warning:</b> ' . json_encode($warning) . '</p>';
			}
			$helpers->mail('', MAIL_DEVELOPER_FRONTEND, 'Warning minify JS', implode('', $message));

			return false;
		}

		if (isset($response->body->serverErrors)) {
			$message = [
				'<p><b>File:</b> ' . URL_THEME . $file . '</p>'
			];
			foreach ($response->body->serverErrors as $error) {
				$message[] = '<p><b>Warning:</b> ' . json_encode($error) . '</p>';
			}
			$helpers->mail('', MAIL_DEVELOPER_FRONTEND, 'Server error minify JS', implode('', $message));

			return false;
		}

		return $response->body->compiledCode;
	}
}
?>