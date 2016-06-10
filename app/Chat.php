<?php
namespace Chat;

use Chat\Auth\LdapAuthenticator;
use Chat\Config\Config;
use Chat\Controllers\MessageController;
use Chat\Db\Db;
use Exception;
use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;
use SplObjectStorage;

class Chat implements MessageComponentInterface
{
    protected static $authenticator;
    protected $clients;
    protected $msgController;

    /**
     * Chat constructor. This creates a storage object to hold the clients
     */
    public function __construct()
    {
        $this->clients = new SplObjectStorage;
        self::$authenticator = new LdapAuthenticator(Config::get('ldap'));
        $this->msgController = new MessageController();
    }

    /**
     * Triggered when a client opens a connection
     * @param ConnectionInterface $conn
     */
    public function onOpen(ConnectionInterface $conn)
    {
        // Attach client to pool
        $this->clients->attach($conn);

        /** @noinspection PhpUndefinedFieldInspection */
        echo "New connection with ID " . $conn->resourceId . PHP_EOL;

        $recents = $this->msgController->getRecentMessages(12);
        // Send the last 12 messages to the user
        foreach ($recents as $message) {
            $conn->send(json_encode($message));
        }
    }

    /**
     * Triggered when a message is received
     * @param ConnectionInterface $from
     * @param string $msg
     */
    public function onMessage(ConnectionInterface $from, $msg)
    {
        // Let's see what we got eh
        var_dump($msg);

        $message = Message::Build($msg);

        // Now what does the message look like
        var_dump($message);

        switch ($message->type) {
            case Message::TYPE_VERIFICATION:
                //TODO: fancy user authentication
                break;
            case Message::TYPE_MESSAGE:
                // Only authenticated users are allowed to send messages
                if ($from->Session->get('authenticated')) {
                    // Write the message to stdout
                    echo '[' . date('G:i:s', $message->time) . '] (ID ' . $from->resourceId . ')' . $message->username . ': ' . $message->message . PHP_EOL;

                    $this->sendMessageToAll($message);
                }
                break;
        }

        if ($message->type == Message::TYPE_VERIFICATION) {
            // The password is contained in the payload
            $user = self::$authenticator->authenticate($message->username, $message->payload);
            if ($user['status'] === 'success') {
                $from->Session->set('authenticated', true);
                $from->Session->set('username', $user['username']);
                $from->Session->set('common_name', $user['common_name']);
            }
            $user['type'] = 'verification';
            if ($message->flags == 'silent')
                $user['flags'] = 'silent';
            $from->send(json_encode($user));
            return;
        }
    }

    private function sendMessageToAll($message)
    {
        // Filter bad words
        $message->message = $this->msgController->filter_bad_words($message->message);

        // Write to chat_log table
        $this->writeLog($message);

        // Send the message to all connected clients
        foreach ($this->clients as $client) {
            $client->send(json_encode($message));
        }
    }

    /**
     * Writes a row to the log table
     * @param mixed $message
     * @return int
     */
    private function writeLog($message)
    {
        return Db::getInstance()
            ->insertInto('chat_log', [
                'user_id' => $message->username,
                'message' => $message->message
            ])->execute();
    }

    /**
     * Triggered wanneer een client de connectie verbreekt
     * @param ConnectionInterface $conn
     */
    public function onClose(ConnectionInterface $conn)
    {
        $this->clients->detach($conn);

        /** @noinspection PhpUndefinedFieldInspection */
        echo "Connection {$conn->resourceId} has disconnected!\n";
    }

    /**
     * Triggered wanneer er een error opkomt
     * @param ConnectionInterface $conn
     * @param Exception $e
     * @throws Exception
     */
    public function onError(ConnectionInterface $conn, Exception $e)
    {
        echo "Error occurred!" . PHP_EOL;
        $conn->close();

        //rethrow the exception YOLO
        throw $e;
    }
}
