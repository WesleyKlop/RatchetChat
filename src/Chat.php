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

        $this->writeLog($msg);

        /** @noinspection PhpUndefinedFieldInspection */
        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n", $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');

        foreach ($this->clients as $client) {
            if ($from !== $client) {
                $client->send($msg);
            }
        }
    }

    /**
     * Writes a line to the log file.
     * The log file will looks like `logs/chat-29-12-1997.log`
     * A line in that file will look like `[13:37:49] (Wesley): This is kind of awesome!`
     * @param string $message
     */
    private function writeLog($message)
    {
        $message = json_decode($message);
        $dateTime = new \DateTime();
        $logFile = "chat-" . $dateTime->format('d-m-Y') . '.log';
        $logPath = __DIR__ . '/../logs/' . $logFile;

        $file = fopen($logPath, 'a');
        $logLine = '[' . $dateTime->format('H:i:s') . '] ';
        $logLine .= '(' . $message->username . '): ';
        $logLine .= $message->message;
        $logLine .= "\n";
        fwrite($file, $logLine);
        fclose($file);
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
