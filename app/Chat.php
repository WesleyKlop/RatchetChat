<?php
namespace Chat;

use Chat\Auth\LdapAuthenticator;
use Chat\Config\Config;
use Chat\Db\Db;
use Exception;
use FluentLiteral;
use PDO;
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
        self::$authenticator = new LdapAuthenticator(Config::get('ldap'));
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

        // Reverse the messages so they are in the correct order
        $recents = $this->getRecentMessages(12);
        var_dump($recents);
        $recentMessages = array_reverse($recents);
        // Send the last 12 messages to the user
        foreach ($recentMessages as $message) {
            $message['flags'] = 'silent';
            $conn->send(json_encode($message));
        }
    }

    private function getRecentMessages($limit)
    {
        $stmt = Db::getInstance()
            ->from('chat_log')
            ->select([
                'chat_log.user_id AS username',
                'chat_log.message',
                'users.common_name',
                new FluentLiteral('UNIX_TIMESTAMP(chat_log.datetime) AS time')
            ])
            ->leftJoin('users ON users.user_id = chat_log.user_id')
            ->orderBy('chat_log.datetime DESC')
            ->limit($limit);

        var_dump($stmt->getQuery());

        return $stmt
            ->execute()
            ->fetchAll(PDO::FETCH_ASSOC);
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
            $from->send(json_encode($user));
            return;
        }

        // Block unauthenticated users
        if (!$from->Session->get('authenticated')) {
            return;
        }

        $numRecv = count($this->clients) - 1;

        // Filter bad words! naughty naughty
        $message->message = $this->filter_bad_words($message->message);

        $this->writeLog($message);

        /** @noinspection PhpUndefinedFieldInspection */
        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n", $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');

        foreach ($this->clients as $client) {
            $client->send(json_encode($message));
        }
    }

    /**
     * Case insensitive replacement of bad words fetched from the banned_words table
     * @param string $message
     * @return string the new message
     */
    private function filter_bad_words($message)
    {
        $words = Db::getInstance()
            ->from('banned_words')
            ->select(['bad_word', 'replacement']);


        foreach ($words as $word) {
            $message = str_ireplace($word['bad_word'], $word['replacement'], $message);
        }

        return $message;
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
