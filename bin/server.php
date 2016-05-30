#!/usr/bin/php
<?php
use Chat\Chat;
use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Ratchet\Session\SessionProvider;
use Ratchet\WebSocket\WsServer;

require_once __DIR__ . '/../vendor/autoload.php';

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new SessionProvider(
                new Chat(),
                new SessionHandler()
            )
        )
    ),
    1337
);

$server->run();