<?php
class Route
{
	public function routing()
	{
		global $urls, $visitor, $core, $helpers;

		if (isset($urls[0]) && $urls[0] === 'lang') {
			$visitor->set_lang(@$urls[1]);
		}

		if (isset($_GET['lang']) && !empty($_GET['lang'])) {
			$visitor->set_lang_temp($_GET['lang']);
		}

		if (isset($_POST['section']) && $_POST['section'] === 'helpdesk') {
			$this->support_helpdesk();
		}

		if (isset($urls[0]) && $urls[0] === 'sitemap.xml') {
			$helpers->get_sitemap();
		}

		if (isset($urls[0]) && $urls[0] === 'placeholder') {
			$core->files->getPlaceholder(@$urls[1], @$urls[2]);
		}

		if (isset($urls[0]) && $urls[0] === 'file_download') {
			$core->files->getFileDownload(@$urls[1]);
		}

		if (isset($urls[0]) && $urls[0] === 'qrs') {
			$this->qrs();
		} else if (isset($urls[0]) && $urls[0] === 'subscribe') {
			//$this->subscribe();
		} else {
			$this->get_template();
		}
	}

	private function support_helpdesk()
	{
		global $db;

		$query = isset($_POST['query']) ? $_POST['query'] : false;

		if ($query === 'send_message') {
			$ticket = $_POST['ticket'];
			$message = $_POST['message'];
			$id_item = $_POST['id_item'];
			$user = $_POST['user'];

			$id_item = $db->insert('help_tickets_items', [
				'ticket' => $ticket,
				'id_item' => $id_item,
				'desc' => $message,
				'user' => $user,
				'readed' => 0,
				'date' => time()
			]);

			json(['status' => true, 'id_item' => $id_item]);
			
		}
	}

	private function qrs()
	{
		global $core, $urls, $helpers;

		if ($urls[1] === 'getfile') {
			$core->files->getFile(@$urls[2], @$urls[3], @$urls[4], @$urls[5], false, @$urls[6]);
		}

		if ($urls[1] === 'report_error') {
			$helpers->mail(MAIL_DEVELOPER_BACKEND, URL_SITE_SHORT . ' - Error!', @$_REQUEST['message']);
			die;
		}
	}

	private function subscribe()
	{
		global $db;

		if (isset($_REQUEST['email'])) {
			$email = $_REQUEST['email'];

			$arr = $db->select('subscribes', '*', [
				'mail' => $email,
			], __FILE__, __LINE__);

			if (empty($arr)) {
				$id = $db->insert('subscribes', ['mail' => $email], __FILE__, __LINE__);
				if ($id) {
					$json['status'] = 'OK';
					return;
				}
			} else {
				$result = $db->delete('subscribes', 'mail', $email, __FILE__, __LINE__);
				if ($result) {
					$json['status'] = 'Unsubscribed';
					return;
				} 
			}

			json($json);
		}
	}

	private function get_template()
	{
		global $urls, $db, $core, $settings, $constants, $visitor, $g_fields, $cl_template, $basket, $helpers;

		$constants = json_decode($settings['constants'], true);
		$constants = array_map(function($v){
			global $visitor;

			return $v[$visitor->lang] ?: '';
		}, $constants);

		$maintenanceMode = (int) $settings['maintenanceMode'] === 1;

		if ($maintenanceMode && !$visitor->is_logged) {
			require_once(DIR_THEME . 'maintenance.template.php');
			die;
		}

		$template = false;
		$caching = true;
		$header_enable = true;
		$footer_enable = true;

		$routing = json_decode($settings['routing'], true);
		$request = str_replace('?' . $_SERVER['QUERY_STRING'], '', $_SERVER['REQUEST_URI']);
		$request = str_replace('//', '/', $request . '/');
		$request = urldecode($request);

		foreach ($routing as $i => $el) {
			$re = str_replace('/', '\/', $i);
			$re = str_replace('*', '[^\/]+', $re);
			preg_match('/^' . $re . '$/', $request, $match);
			if ($match) {
				$template = $el[0];
				$caching = $el[1];
				break;
			}
		}

		if (!$template) {
			header('Location: ' . URL_SITE);
			die;
		}

		$file_model = DIR_THEME . 'models/' . $template . '.model.php';
		$file_template = DIR_THEME . $template . '.template.php';

		if (!file_exists($file_model)) {
			$helpers->file_create($file_model, "<?php\r\n\r\n?>");
		}
		if (!file_exists($file_template)) {
			$helpers->file_create($file_template, "<div id=\"" . $template . "\">\r\n\r\n</div>");
		}

		if ($caching && !$visitor->is_logged) {
			$key = 'theme_' . VERSION_THEME . '_' . (int) $urls['isAjax'] . '_' . $visitor->lang . '_' . md5(URL_SITE . implode('/', $urls));

			$cache = $core->cache->getCache($key);
			if ($cache) {
				echo $cache;
				return false;
			} else {
				ob_start();
			}
		}

		require_once(DIR_CORE . 'api_frontend.php');
		require_once(DIR_THEME . 'common.php');
		require_once($file_model);
		if ($header_enable) require_once(DIR_THEME . 'header.template.php');
		require_once($file_template);
		if ($footer_enable) require_once(DIR_THEME . 'footer.template.php');

		if ($caching && !$visitor->is_logged) {
			$cache = ob_get_clean();
			$cache = $core->minify->HTML($cache);
			$core->cache->setCache($key, $cache);
			echo $cache;
		}
	}
}
?>