<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 30-5-16
 * Time: 9:39
 */

namespace Chat\Auth;

use Chat\Message;

interface AuthInterface
{
    /**
     * Authenticates the user
     * @param string $username
     * @param string $password
     * @return Message|array the user info in an array or A snackbar Message on error
     */
    function authenticate($username, $password);

    /**
     * Checks if a user is banned
     * @param string $username
     * @return string|false the reason the user is banned or false
     */
    function isBanned($username);
}