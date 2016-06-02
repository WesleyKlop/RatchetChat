<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 30-5-16
 * Time: 9:39
 */

namespace Chat\Auth;


interface AuthInterface
{
    /**
     * Authenticates a user
     * @param $username
     * @param $password
     * @return bool
     */
    function authenticate($username, $password);

    /**
     * Checks if a user is banned
     * @param string $username
     * @return string|false the reason the user is banned or false
     */
    function isBanned($username);
}