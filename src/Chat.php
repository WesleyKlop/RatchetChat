<?php
namespace Chat;

use Exception;
use PDO;
use PDOException;
use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;
use SplObjectStorage;

class Chat implements MessageComponentInterface
{
    protected static $authenticator;
    protected $clients;

    /**
     * Chat constructor. This creates a storage object to hold the clients
     */
    public function __construct()
    {
        $this->clients = new SplObjectStorage;
        $config = parse_ini_file(__DIR__ . '/../ldap.ini');
        self::$authenticator = new Authenticator($config);
    }

    /**
     * Triggered when a client opens a connection
     * @param ConnectionInterface $conn
     */
    public function onOpen(ConnectionInterface $conn)
    {
        $this->clients->attach($conn);

        /** @noinspection PhpUndefinedFieldInspection */
        echo "New connection with ID " . $conn->resourceId . PHP_EOL;
    }

    /**
     * Triggered when a message is received
     * @param ConnectionInterface $from
     * @param string $msg
     */
    public function onMessage(ConnectionInterface $from, $msg)
    {
        $message = json_decode($msg);
        if ($message->type == 'verification') {
            $user = self::$authenticator->authenticate($message->username, $message->password);
            if ($user['status'] === 'success') {
                $from->Session->set('authenticated', true);
                $from->Session->set('username', $user['username']);
                $from->Session->set('common_name', $user['common_name']);
            }
            $user['type'] = 'verification';
            var_dump($user);
            $from->send(json_encode($user));
            return;
        }

        // Block unauthenticated users
        if (!$from->Session->get('authenticated')) {
            return;
        }

        $numRecv = count($this->clients) - 1;

        $this->writeLog($msg);

        /** @noinspection PhpUndefinedFieldInspection */
        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n", $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');

        foreach ($this->clients as $client) {
//            if ($from !== $client) {
                $client->send($msg);
//            }
        }
    }

    /**
     * Writes a row to the log table
     * @param string $message
     */
    private function writeLog($message)
    {
        $message = json_decode($message);
        $dbh = Database::getInstance();

        $stmt = $dbh->prepare("INSERT INTO chat_log (user_id, message) VALUES (:user_id, :message)");
        $stmt->bindParam(':user_id', $message->username, PDO::PARAM_INT);
        $stmt->bindParam(':message', $message->message, PDO::PARAM_STR);

        try {
            $stmt->execute();
        } catch (PDOException $e) {
            echo "Error occurred!" . PHP_EOL . $e->getMessage();
        }
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
     */
    public function onError(ConnectionInterface $conn, Exception $e)
    {
        echo "Error occurred!" . $e->getMessage() . "\n";

        $conn->close();
    }
}
