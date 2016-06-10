<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 6/10/16
 * Time: 2:58 PM
 */

namespace Chat\Controllers;


use Chat\Db\Db;
use Chat\Message;
use DateTime;
use Exception;
use FluentLiteral;
use PDO;

class MessageController
{
    /**
     * Get a Snackbar message
     * @param string $payload
     * @param int|double|float $timeout
     * @return Message
     */
    public static function Snackbar($payload, $timeout = 20000)
    {
        // Snackbar doesn't need any special things because it's only sent by the server.
        $message = new Message();

        $message->type = Message::TYPE_SNACKBAR;
        $message->payload = $payload;
        $message->flags = ['timeout' => $timeout];
        $message->status = Message::STATUS_SUCCESS;

        return $message;
    }

    /**
     * Returns an array containing the last send messages
     * @param $limit
     * @return Message[]
     * @throws Exception when the message wasn't valid
     */
    public function getRecentMessages($limit)
    {
        $rawMessages = Db::getInstance()
            ->from('chat_log')
            ->select([
                'chat_log.user_id AS username',
                'chat_log.message',
                'users.common_name',
                new FluentLiteral('UNIX_TIMESTAMP(chat_log.datetime) AS time')
            ])
            ->leftJoin('users ON users.user_id = chat_log.user_id')
            ->orderBy('chat_log.datetime DESC')// Order DESC because we want the newest $limit messages
            ->limit($limit)
            ->execute()
            ->fetchAll(PDO::FETCH_ASSOC);
        // Reverse the array so it's the oldest message first
        $rawMessages = array_reverse($rawMessages);

        // Build a Message[]
        $messages = [];
        foreach ($rawMessages as $rawMessage) {
            $message = $this->buildMessage($rawMessage, ['silent']);
            $message->type = Message::TYPE_MESSAGE;

            $message->verify();
            if ($message->status !== Message::STATUS_SUCCESS)
                throw new Exception('A recent message wasn\'t valid.. HOW!?');

            $messages[] = $message;
        }

        return $messages;
    }

    /**
     * Build a message from what we received from the database
     * @param array $fields
     * @param array $flags
     * @return Message
     */
    public function buildMessage(array $fields, array $flags = [])
    {
        $message = Message::Create($flags,
            $fields['username'], $fields['common_name'],
            $fields['message'], new DateTime('@' . $fields['time']));

        // Add existing flags if they exist
        $message->flags = array_unique(array_merge(
            $message->flags,
            (isset($fields['flags']) ? $fields['flags'] : [])
        ));

        return $message;
    }

    /**
     * Case insensitive replacement of bad words fetched from the banned_words table
     * @param Message $message
     * @return Message the new message
     */
    public function filter_bad_words($message)
    {
        $words = Db::getInstance()
            ->from('banned_words')
            ->select(['bad_word', 'replacement']);

        foreach ($words as $word) {
            $message->payload = str_ireplace($word['bad_word'], $word['replacement'], $message->payload);
        }

        return $message;
    }
}