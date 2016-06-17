<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 6/17/16
 * Time: 11:04 PM
 */

namespace Chat\Auth;

use Chat\Controllers\MessageController;
use Chat\Db\Db;
use Chat\User;
use InvalidArgumentException;
use PDO;
use PDOStatement;

class DbAuthenticator extends AbstractAuth
{

    /** @inheritdoc */
    function authenticate($username, $password)
    {
        if (empty($username) || empty($password))
            return MessageController::Snackbar('Missing username or password');

        // Try to fetch the user from the database
        $dbh = Db::getInstance();
        $stmt = $dbh->from('users')
            ->where('user_id', $username)
            ->execute();

        // Check if the user exists
        if ($stmt->rowCount() < 1)
            return MessageController::Snackbar('Invalid username or password');

        $userArr = $stmt->fetch(PDO::FETCH_ASSOC);

        // If it exists verify the password
        if (!password_verify($password, $userArr['password_hash']))
            return MessageController::Snackbar('Invalid username or password');

        // Check and rehash password if needed
        if (password_needs_rehash($userArr['password_hash'], PASSWORD_DEFAULT))
            $this->rehashPassword($userArr['user_id'], $password);

        // Check if the user is banned and return reason if true
        if (($banReason = $this->isBanned($username)) !== false)
            return MessageController::Snackbar('You are banned!\nReason: ' . $banReason);

        // Build the user model
        return User::Build($userArr['user_id'], $userArr['common_name']);
    }

    /**
     * Rehashes the users password with PASSWORD_DEFAULT
     * @param string $username
     * @param string $password
     * @return PDOStatement
     */
    private function rehashPassword($username, $password)
    {
        // Create the new hash
        $newPass = password_hash($password, PASSWORD_DEFAULT);
        // Update the Database
        return Db::getInstance()
            ->update('users', ['password_hash' => $newPass])
            ->where('user_id', $username)
            ->execute();
    }

    /**
     * Adds a user to the users table
     * @param string $username
     * @param string $common_name
     * @param string $password
     * @return int
     */
    public function register($username, $common_name, $password)
    {
        if (empty($username))
            throw new InvalidArgumentException('Empty parameter username');
        if (empty($common_name))
            throw new InvalidArgumentException('Empty parameter common_name');
        if (empty($password))
            throw new InvalidArgumentException('Empty parameter password');

        $values = [
            'user_id' => $username,
            'common_name' => $common_name,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT)
        ];

        return Db::getInstance()
            ->insertInto('users', $values)
            ->execute();
    }
}
