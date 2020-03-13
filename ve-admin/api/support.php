<?php
if ($section === 'support')
{
	if ($query === 'help_get_list')
	{
		$items = $db->select('help_tickets_items', ['ticket'], ['readed' => 0]);
		$items = array_column($items, 'ticket', 'ticket');

		$list = $db->select('help_tickets', '*', []);
		$list = array_map(function($el) use ($items) {
			$data = [$el['id'], $el['title']];
			if (isset($items[$data[0]])) $data[] = 1;
			return $data;
		}, $list);
		$list = array_reverse($list);
		usort($list, function($a, $b) {
			$a = $a[2] ?? 0;
			$b = $b[2] ?? 0;

			if ($a === $b) return 0;
			return ($a > $b) ? -1 : 1;
		});

		json($list);
	}
	if ($query === 'help_create_ticket')
	{
		$name = $_POST['name'];
		$desc = $_POST['desc'];
		$host = $_POST['host'];

		$id = $db->insert('help_tickets', ['id_ticket' => 0, 'title' => $name]);

		$id_item = $db->insert('help_tickets_items', [
			'ticket' => $id,
			'id_item' => 0,
			'desc' => $desc,
			'user' => $visitor->fname,
			'readed' => 1,
			'date' => time()
		]);

		try {
			$response = Unirest\Request::post($settings['updateServerCore'], [], [
				'section' => 'helpdesk',
				'query' => 'create_ticket',
				'id_ticket' => $id,
				'id_item' => $id_item,
				'title' => $name,
				'desc' => $desc,
				'user' => $visitor->fname,
				'company' => $settings['siteTitle'],
				'host' => $host
			]);

			$json = (array) $response->body;

			if ($json['status'] === true) {
				$db->update('help_tickets', ['id_ticket' => $json['id']], 'id', $id);
				$db->update('help_tickets_items', ['id_item' => $json['id_item']], 'id', $id_item);
			}
		} catch (Exception $e) {
			$cache = ['status' => false];
		}

		json(['status' => true, 'id' => $id]);
	}
	if ($query === 'help_open_ticket')
	{
		$id = $_POST['id'];

		$items = $db->select('help_tickets_items', '*', ['ticket' => $id]);
		$db->update('help_tickets_items', ['readed' => 1], 'ticket', $id);

		json(['status' => true, 'items' => $items]);
	}
	if ($query === 'help_get_new_message')
	{
		$id = $_POST['id'];

		$items = $db->select('help_tickets_items', '*', ['ticket' => $id, 'readed' => 0]);
		$db->update('help_tickets_items', ['readed' => 1], 'ticket', $id);

		json(['status' => true, 'items' => $items]);
	}
	if ($query === 'help_send_message')
	{
		$ticket = $_POST['ticket'];
		$message = $_POST['message'];

		$id_item = $db->insert('help_tickets_items', [
			'ticket' => $ticket,
			'id_item' => 0,
			'desc' => $message,
			'user' => $visitor->fname,
			'readed' => 1,
			'date' => time()
		]);
		$t = $db->select('help_tickets', ['id_ticket'], ['id' => $ticket]);
		$t = $t[0]['id_ticket'];

		// send to server
		try {
			$response = Unirest\Request::post($settings['updateServerCore'], [], [
				'section' => 'helpdesk',
				'query' => 'send_message',
				'ticket' => $t,
				'message' => $message,
				'id_item' => $id_item,
				'user' => $visitor->fname
			]);

			$json = (array) $response->body;

			if ($json['status'] === true) {
				$db->update('help_tickets_items', ['id_item' => $json['id_item']], 'id', $id_item);
			}
		} catch (Exception $e) {
			$cache = ['status' => false];
		}

		json(['status' => true]);
	}

	if ($query === 'faq_get_list')
	{
		// $key = 'admin_support_get_list_faq';
		// $cache = $core->cache->getCache($key);

		// if (!$cache) {
			$server = $settings['updateServerCore'];

			try {
				$response = Unirest\Request::post($server, [], [
					'section' => 'faq',
					'query' => 'get_list'
				]);

				$cache = (array) $response->body;
				// $core->cache->setCache($key, $cache, 1209600); // two week
			} catch (Exception $e) {
				$cache = ['status' => false];
			}
		// }

		json($cache);
	}
}
?>