<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 30-5-16
 * Time: 9:36
 */

namespace Chat;

use Adldap\Adldap;
use Adldap\Connections\Provider;
use Adldap\Exceptions\Auth\PasswordRequiredException;
use Adldap\Exceptions\Auth\UsernameRequiredException;
use Adldap\Models\User;
use Adldap\Query\Builder;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use PDO;

/**
 * Class Authenticator
 * This class is used to authenticate and semi-manage users (for now)
 * @package Chat
 */
class Authenticator implements IAuthenticator
{
    private $adLdap;
    private $provider;

    /**
     * Authenticator constructor.
     * @param string $ldapConfig path to ldap config file
     * @throws FileNotFoundException
     */
    public function __construct($ldapConfig)
    {
        // Create provider and AdLdap
        $this->provider = new Provider($ldapConfig);
        $this->adLdap = new Adldap();
        // Bind provider
        $this->adLdap->addProvider('default', $this->provider);
        // Connect to the provider
        $this->adLdap->connect('default');
    }

    /**
     * Authenticates a user
     * @param $username
     * @param $password
     * @return array
     */
    public function authenticate($username, $password)
    {
        // Create a default response which will be edited over the course of this script
        $data = null;
        $response = [
            'status' => 'failure',
            'response' => null
        ];

        // Try authenticating
        try {
            if ($this->provider->auth()->attempt($username, $password, true)) {
                // Successfully authenticated, get the user information
                /** @var Builder $search */
                $search = $this->provider->search();
                /** @var User $user */
                $user = $search->find($username);

                if (($banReason = $this->isBanned($username)) !== false) {
                    $response['type'] = 'ban';
                    $data = "You are banned! \nReason: " . $banReason;
                    $response['response'] = $data;
                    return $response;
                }

                $response['status'] = 'success';
                $data['username'] = $username;
                $data['common_name'] = $user->getDisplayName();

                if (!$this->userExists($username)) {
                    $this->addUser($username, $user->getDisplayName());
                }
            } else {
                $data = 'Invalid username or password';
            }
        } catch (UsernameRequiredException $e) {
            $data = 'Missing username';
        } catch (PasswordRequiredException $e) {
            $data = 'Missing password';
        }
        $response['response'] = $data;
        return $response;
    }

    /**
     * Checks if a user is banned and returns the reason if yes
     * @param string $username
     * @return string|bool the reason for the ban or false if not banned
     */
    public function isBanned($username)
    {
        $dbh = Database::getInstance();
        $stmt = $dbh->prepare("SELECT reason FROM banned_users WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $username]);

        // Return the reason the user is banned or false
        return $stmt->fetch(PDO::FETCH_ASSOC)['reason'] ?: false;
    }

    /**
     * Checks if the user exists in the users table
     * @param string $username
     * @return bool
     */
    private function userExists($username)
    {
        $dbh = Database::getInstance();
        $stmt = $dbh->prepare('SELECT user_id FROM users WHERE user_id = :user_id');
        $stmt->execute([':user_id' => $username]);

        // Returns true if there are more than 0 users
        return $stmt->rowCount() > 0;
    }

    /**
     * Adds a user to the users database
     * @param string $username
     * @param string $common_name
     * @return bool success if the user is added or false
     */
    private function addUser($username, $common_name)
    {
        $dbh = Database::getInstance();
        $stmt = $dbh->prepare('INSERT INTO users (user_id, common_name) VALUES (:user_id, :cn)');
        return $stmt->execute([
            ':user_id' => $username,
            ':cn' => $common_name
        ]);
    }
}