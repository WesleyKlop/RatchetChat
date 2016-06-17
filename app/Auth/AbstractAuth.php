<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 30-5-16
 * Time: 9:39
 */

namespace Chat\Auth;

use Chat\Config\Config;
use Chat\Db\Db;
use Chat\Message;
use Chat\User;
use Firebase\JWT\JWT;
use PDO;

abstract class AbstractAuth
{
    /**
     * Authenticates the user
     * @param string $username
     * @param string $password
     * @return Message|User the user info in an array or A snackbar Message on error
     */
    abstract function authenticate($username, $password);

    /**
     * This function generates a JWT for the client to store in localstorage for authentication
     * @param string $username
     * @param string $password
     * @return string the JWT
     */
    public function generateJWT($username, $password)
    {
        $key = Config::get('jwt.key');
        $token = [
            'iss' => Config::get('jwt.iss'),
            'aud' => Config::get('jwt.aud'),
            'iat' => time(),
            // Token is valid for 30 days
            'exp' => time() + 2592000,
            'username' => $username,
            'password' => $password
        ];

        $jwt = JWT::encode($token, $key);

        return $jwt;
    }

    /**
     * Checks if a user is banned and returns the reason if yes
     * @param string $username
     * @return string|bool the reason for the ban or false if not banned
     */
    public function isBanned($username)
    {
        $stmt = Db::getInstance()
            ->from('banned_users')
            ->select('reason')
            ->where('user_id = ?', $username)
            ->execute();

        // Return the reason the user is banned or false
        return $stmt->fetch(PDO::FETCH_ASSOC)['reason'] ?: false;
    }

    /**
     * Checks if the user exists in the users table
     * @param string $username
     * @return bool
     */
    protected function userExists($username)
    {
        $stmt = Db::getInstance()
            ->from('users')
            ->select('user_id')
            ->where('user_id', $username)
            ->execute();

        // Returns true if there are more than 0 users
        return $stmt->rowCount() > 0;
    }

    /**
     * Adds a user to the users database
     * @param string $username
     * @param string $common_name
     * @return bool success if the user is added or false
     */
    protected function addUser($username, $common_name)
    {
        return Db::getInstance()
            ->insertInto('users')
            ->values(['user_id' => $username, 'common_name' => $common_name])
            ->execute();
    }
}
