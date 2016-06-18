<?php
namespace Chat;

use Chat\Auth\DbAuthenticator;
use Chat\Auth\LdapAuthenticator;
use Chat\Config\Config;
use Chat\Controllers\MessageController;
use Chat\Db\Db;
use Exception;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
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
        switch (Config::get('app.auth')) {
            case 'ldap':
                self::$authenticator = new LdapAuthenticator(Config::get('ldap'));
                break;
            case 'database':
                self::$authenticator = new DbAuthenticator();
                break;
            default:
                throw new Exception('Invalid authenticator selected!');
        }
    }

    /**
     * Triggered when a client opens a connection
     * @param ConnectionInterface $conn
     */
    public function onOpen(ConnectionInterface $conn)
    {
        // Attach client to pool
        $this->clients->attach($conn);

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
        $message = Message::Build($msg);

        switch ($message->type) {
            case Message::TYPE_VERIFICATION:
                if ($message->hasFlag('silent')) {
                    try {
                        $jwt = (array)JWT::decode($message->payload, Config::get('jwt.key'), ['HS256']);
                    } catch (ExpiredException $e) {
                        $from->send(json_encode(MessageController::Snackbar('Your token is expired! Please try signing in again.')));
                        break;
                    }
                    $username = $jwt['username'];
                    $password = $jwt['password'];
                } else {
                    $username = $message->username;
                    $password = $message->payload;
                }

                $response = self::$authenticator->authenticate($username, $password);

                // If we got a message object we can send that and stop there
                if ($response instanceof Message && $response->type === Message::TYPE_SNACKBAR) {
                    // If it's a snackbar that means something went wrong so we should set the status to failure
                    $response->status = Message::STATUS_FAILURE;
                    $from->send(json_encode($response));
                    break;
                }

                // We should have the users' username and common_name, save that in the session
                $from->Session->set('authenticated', true);
                $from->Session->set('username', $response->getUsername());
                $from->Session->set('common_name', $response->getCommonName());

                // And now we send a friendly message back
                $msg = new Message();
                $msg->type = Message::TYPE_VERIFICATION;
                $msg->username = $response->getUsername();
                $msg->common_name = $response->getCommonName();
                $msg->status = Message::STATUS_SUCCESS;

                // Write signin notice to stdout
                echo '[' . $msg->datetime->format('G:i:s') . '] Connection with ID ' . $from->resourceId . ' logged in as ' . $msg->common_name . '(' . $msg->username . ')' . PHP_EOL;

                // Add the silent flag if the original message had it
                if ($message->hasFlag('silent'))
                    $msg->addFlag('silent');

                // Add a JWT as payload if the message has the 'remember' flag
                if ($message->hasFlag('remember'))
                    $msg->payload = self::$authenticator->generateJWT($message->username, $message->payload);

                // Send the response
                $from->send(json_encode($msg));
                break;
            case Message::TYPE_MESSAGE:
                // Only authenticated users are allowed to send messages
                if ($from->Session->get('authenticated')) {
                    // Verify the message is correct
                    $message->verify();

                    // Filter bad words
                    $this->msgController->filter_bad_words($message);

                    // Write to chat_log table
                    $this->writeLog($message);

                    // Write the message to stdout
                    echo '[' . $message->datetime->format('G:i:s') . '] (ID ' . $from->resourceId . ')' . $message->username . ': ' . $message->payload . PHP_EOL;

                    $this->sendMessageToAll($message);
                }
                break;
        }
    }

    /**
     * Writes a row to the log table
     * @param Message $message
     * @return int
     */
    private function writeLog($message)
    {
        return Db::getInstance()
            ->insertInto('chat_log', [
                'user_id' => $message->username,
                'message' => $message->payload
            ])
            ->execute();
    }

    private function sendMessageToAll($message)
    {
        // Send the message to all connected clients
        foreach ($this->clients as $client) {
            $client->send(json_encode($message));
        }
    }

    /**
     * Triggered wanneer een client de connectie verbreekt
     * @param ConnectionInterface $conn
     */
    public function onClose(ConnectionInterface $conn)
    {
        $this->clients->detach($conn);

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
        echo "Error occurred, blame " . $conn->Session->get('common_name') . '!' . PHP_EOL;
        $conn->close();

        //rethrow the exception YOLO
        throw $e;
    }
}
