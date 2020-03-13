<?php
class Helpers
{
	public function mail($to, $subject, $message, $from_mail = MAIL_DEVELOPER_BACKEND, $from_name = 'Admin', $date = false)
	{
		$mail = new PHPMailer();
		$mail->charSet = 'UTF-8';

		$mail->setFrom($from_mail, $from_name);
		if (is_array($to)) {
			foreach ($to as $el) {
				if ($el['type'] == 'cc') {
					$mail->addCC($el['email'], $el['name']);
				} else if ($el['type'] == 'bcc') {
					$mail->addBCC($el['email'], $el['name']);
				} else {
					$mail->addAddress($el['email'], $el['name']);
				}
			}
		} else {
			$mail->addAddress($to);
		}

		$mail->isHTML(true);

		$mail->Subject = $subject;
		$mail->Body    = $message;
		$mail->AltBody = strip_tags(str_replace(['<br>', '</br>'], "\r\n", $message));

		if(!$mail->send()) {
			return ['status' => 'FAIL', 'error' => $mail->ErrorInfo];
		} else {
			return ['status' => 'OK'];
		}
	}

	public function get_sitemap()
	{
		global $db, $core, $settings, $urls, $visitor, $g_fields, $cl_template, $locations;

		require_once(DIR_CORE . 'api_frontend.php');

		$locations = [];

		function recursive($i, $date = false) {
			global $locations;

			$find = strrpos($i, '*');

			if ($find === false) {
				$date = $date ? $date : time();
				$date = date('Y-m-d\TH:i:s+00:00', $date);
				$url = '<url><loc>' . URL_SITE . $i . '</loc><lastmod>' . $date . '</lastmod></url>';
				$locations[] = str_replace(URL_PROTOKOL . ':/', URL_PROTOKOL . '://', str_replace('//', '/', $url));
			} else {
				$str = explode('/', $i);
				foreach ($str as $k => $v) {
					if ($v === '*') {
						$parent = $str[$k - 1];

						// get id parent
						if (empty($parent)) {
							$parent = '#';
						} else {
							$item = get_itemByAlias($parent);

							if ($item) {
								$parent = $item['id'];
							} else {
								break;
							}
						}

						// get items of parent
						$items = get_items($parent);
						foreach ($items as $item) {
							$str[$k] = $item['alias'];
							recursive(implode('/', $str), $item['date_change']);
						}

						break;
					}
				}
			}
		};

		$routing = json_decode($settings['routing'], true);

		foreach ($routing as $i => $el) {
			if ((isset($el[2]) && $el[2]) || !isset($el[2])) recursive($i);
		}

		$sitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . implode('', $locations) . '</urlset>';

		header_remove();
		header('Content-Type: text/xml; charset=utf-8');
		echo $sitemap;
		die;
	}

	public function get_translit($str)
	{
		$str = mb_strtolower($str, 'UTF-8');

		$tr = [
			' '=> '-',
			// rus
			'а'=>'a','б'=>'b','в'=>'v','г'=>'g','д'=>'d','е'=>'e','ё'=>'yo','ж'=>'j','з'=>'z','и'=>'i','й'=>'y','к'=>'k','л'=>'l','м'=>'m','н'=>'n','о'=>'o','п'=>'p','р'=>'r','с'=>'s','т'=>'t','у'=>'u','ф'=>'f','х'=>'h','ц'=>'c','ч'=>'ch','ш'=>'sh','щ'=>'sch','ъ'=>'y','ы'=>'y','ь'=>'','э'=>'e','ю'=>'yu','я'=>'ya'
		];
		$str = strtr($str, $tr);
		$str = preg_replace('/[^A-Za-z0-9_-]/', '', $str);

		return $str;
	}

	public function get_langs($str)
	{
		global $settings;

		$lang = [];

		$str = preg_split('/\r\n|\n/', $str);

		foreach ($str as $l) {
			if (!!preg_match('/^{.+}:/', $l)) {
				preg_match('/^{(.+)}:(.*?)$/', $l, $q);
			} else {
				$q = [null, $settings['langFrontDefault'], $l];
			}

			$json = json_decode($q[2], true);
			if (is_array($json)) $q[2] = $json;

			$lang[$q[1]] = $q[2];
		}

		return $lang;
	}

	public function file_create($path, $str)
	{
		$fp = fopen($path, 'w');
		fwrite($fp, $str);
		fclose($fp);
	}

	public function dir_remove($path)
	{
		$this->dir_empty($path);

		if (file_exists($path)) rmdir($path);
	}

	public function dir_empty($path)
	{
		$DI = new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS);
		$II = new RecursiveIteratorIterator($DI, RecursiveIteratorIterator::CHILD_FIRST);
		foreach ($II as $file) {
			$file->isDir() ? $this->dir_remove($file) : unlink($file);
		}
	}

	public function dir_copy($source, $dest)
	{
		if (!file_exists($dest)) mkdir($dest, 0777, true);

		$DI = new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS);
		$II = new RecursiveIteratorIterator($DI, RecursiveIteratorIterator::SELF_FIRST);

		foreach ($II as $object) {
			$destPath = $dest . DIRECTORY_SEPARATOR . $II->getSubPathName();
			($object->isDir()) ? mkdir($destPath) : copy($object, $destPath);
		}
	}

	public function template($str, $obj)
	{
		$template = $str;

		foreach ($obj as $i => $v) {
			$template = preg_replace('/{{' . $i . '}}/', $v, $template);
		}

		return $template;
	}
}

function dp()
{
	$vars = func_get_args();
	if (count($vars) === 0) exit('No arguments...');

	$html = array();
	foreach ($vars as $v) {
		ob_start();
		var_dump($v);		
		$dc = trim(ob_get_contents());
		ob_end_clean();

		ob_start();
		highlight_string('' . $dc . '');
		$hc = trim(ob_get_contents());
		ob_end_clean();

		$content = preg_replace('%('.($fo = '<font color="#\S{6}">') . '&lt;\?' . ($fc = '</font>') .$fo. '/\*\*/'.$fc.')%is', '', $hc);
		$content = preg_replace('%('.$fo.'/\*\*/'.$fc . $fo.'\?&gt;' .$fc. ')%is', '', $content);
		$content = html_entity_decode($content, ENT_NOQUOTES, 'utf-8');
		$content = str_replace(array('<code>', '</code>'), '', $content);
		$content = str_replace('<pre class=\'xdebug-var-dump\' dir=\'ltr\'>', '', $content);
		$content = str_replace('<span style="color: #000">', '', $content);
		$content = str_replace('<font color=\'#', '<font color="#', $content);

		$html[] = '<pre>' . $content . '</pre>';
	}
	echo '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' . implode('<hr>', $html) . '</body></html>';

	die;
}

function json($array)
{
	$json = json_encode($array);

	header_remove();
	header('Content-Type: application/json; charset=utf-8');
	echo $json;
	die;
}
?>