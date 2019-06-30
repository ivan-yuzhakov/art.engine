<?php
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use MyApp\Chat;

require dirname(__DIR__) . '/vendor/autoload.php';
require dirname(__DIR__) . '/ve-admin/chat.php';

$server = IoServer::factory(
	new HttpServer(
		new WsServer(
			new Chat()
		)
	),
	1010
);

$server->run();
// php path_to/ve-admin/websocket.php