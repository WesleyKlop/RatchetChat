<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 7-6-16
 * Time: 13:38
 */

namespace Chat;


use DateTime;
use JsonSerializable;

/**
 * Class Message
 * @package Chat
 */
class Message implements JsonSerializable
{
    const STATUS_SUCCESS = 0;
    const STATUS_FAILURE = 1;
    const STATUS_ERROR = 2;

    const TYPE_MESSAGE = 'message';
    const TYPE_VERIFICATION = 'verify';

    /**
     * The type of message
     * @var string $type
     */
    public $type = 'message';
    /**
     * The message status
     * @var int $status
     */
    public $status = self::STATUS_FAILURE;
    /**
     * The flags the message has eg. silent
     * @var array $flags
     */
    public $flags = [];
    /**
     * The username from the sender
     * @var string $username
     */
    public $username = '';
    /**
     * Sender full name
     * @var string $common_name
     */
    public $common_name = '';
    /**
     * The time the message was sent
     * @var DateTime $datetime
     */
    public $datetime;
    /**
     * The payload, this could be the message or some other info
     * this depends on the type of Message it is
     * @var mixed $payload
     */
    public $payload;


    public function __construct()
    {
    }

    /**
     * Message creator
     * @param array $flags
     * @param string $username
     * @param string $common_name
     * @param mixed $message
     * @param DateTime $datetime
     * @return Message
     */
    public static function Create(array $flags, $username, $common_name, $message, $datetime)
    {
        $msg = new self();
        $msg->flags = $flags;
        $msg->username = $username;
        $msg->common_name = $common_name;
        $msg->payload = $message;
        $msg->datetime = $datetime;

        return $msg;
    }

    /**
     * Deserialize the payload and create a message object
     * @param string $payloadString
     * @return Message
     */
    public static function Build($payloadString)
    {
        $message = new self;
        $payload = json_decode($payloadString, true);
        $message->type = $payload["type"] ?: '';
        $message->status = $payload["status"] ?: self::STATUS_FAILURE;
        $message->payload = $payload["message"] ?: $payload['payload'] ?: '';
        $message->flags = $payload["flags"] ?: [];
        $message->username = $payload["username"] ?: '';
        $message->common_name = $payload["common_name"] ?: '';
        $message->datetime = new DateTime($payload['timestamp'] ?: 'now');

        return $message;
    }

    public function hasFlag($key)
    {
        return in_array($key, $this->flags);
    }

    public function verify($signInFailed = false)
    {
        // We're just going to stop here if there was an error
        if ($this->status === self::STATUS_ERROR)
            return;

        // First we invalidate the message
        $this->status = self::STATUS_FAILURE;

        // We should keep the status on failure if the user failed to sign in
        if ($this->type === self::TYPE_VERIFICATION && $signInFailed) return;

        // Then we verify the things that should always be filled
        if (empty($this->payload)
            || empty($this->type)
            || empty($this->username)
        ) return;

        // Then verify according to message type
        switch ($this->type) {
            case self::TYPE_MESSAGE:
                // We should have everything filled (except flags)
                if (empty($this->datetime)
                    || empty($this->common_name)
                ) return;
                break;
            case self::TYPE_VERIFICATION:
                // We don't need to check anything else
                break;
        }

        // We should be OK now
        $this->status = self::STATUS_SUCCESS;
    }

    /**
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 5.4.0
     */
    function jsonSerialize()
    {
        return [
            "type" => $this->type,
            "status" => $this->status,
            "payload" => $this->payload,
            "flags" => $this->flags,
            "username" => $this->username,
            "common_name" => $this->common_name,
            "timestamp" => $this->datetime->getTimestamp()
        ];
    }
}