<?php
namespace Chat;

use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;

class Chat implements MessageComponentInterface
{

    protected $clients;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn)
    {
        $this->clients->attach($conn);

        /** @noinspection PhpUndefinedFieldInspection */
        echo "New connection with ID " . $conn->resourceId . PHP_EOL;
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        $numRecv = count($this->clients) - 1;

        /** @noinspection PhpUndefinedFieldInspection */
        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n", $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');

        foreach ($this->clients as $client) {
            if ($from !== $client) {
                $client->send($msg);
            }
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        $this->clients->detach($conn);

        /** @noinspection PhpUndefinedFieldInspection */
        echo "Connection {$conn->resourceId} has disconnected!\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "Error occurred!" . $e->getMessage() . "\n";

        $conn->close();
    }
}
