<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 6/17/16
 * Time: 11:05 PM
 */

namespace Chat;


class User
{
    /** @var  string $username */
    protected $username;
    /** @var  string $common_name */
    protected $common_name;

    /**
     * Creates a user model from the username and password
     * @param string $username
     * @param string $common_name
     * @return User
     * @constructor
     */
    public static function Build($username, $common_name)
    {
        $self = new self;
        $self->username = $username;
        $self->common_name = $common_name;

        return $self;
    }

    /**
     * @return string
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * @return string
     */
    public function getCommonName()
    {
        return $this->common_name;
    }

}
