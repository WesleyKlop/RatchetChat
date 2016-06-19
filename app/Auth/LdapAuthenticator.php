<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 30-5-16
 * Time: 9:36
 */

namespace Chat\Auth;

use Adldap\Adldap;
use Adldap\Connections\Provider;
use Adldap\Exceptions\Auth\PasswordRequiredException;
use Adldap\Exceptions\Auth\UsernameRequiredException;
use Adldap\Models\User;
use Adldap\Query\Builder;
use Chat\Controllers\MessageController;
use Illuminate\Contracts\Filesystem\FileNotFoundException;

/**
 * Class Authenticator
 * This class is used to authenticate and semi-manage users (for now)
 * @package Chat
 */
class LdapAuthenticator extends AbstractAuth
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

    /** @inheritdoc */
    public function authenticate($username, $password)
    {
        // Try authenticating
        try {
            $this->provider->connect();
            
            if (!$this->provider->auth()->attempt($username, $password, true))
                return MessageController::Snackbar('Invalid username/password');

            // Successfully authenticated, get the user information
            /** @var Builder $search */
            $search = $this->provider->search();
            /** @var User $user */
            $user = $search->find($username);

            if (($banReason = $this->isBanned($username)) !== false)
                return MessageController::Snackbar('You are banned!\nReason: ' . $banReason);

            $data = \Chat\User::Build($username, $user->getDisplayName());

            // Add the user to the users table if it's not in there yet
            if (!$this->userExists($username))
                $this->addUser($username, $user->getDisplayName());

            // Return the user/password combo as an array
            return $data;
        } catch (UsernameRequiredException $e) {
            return MessageController::Snackbar('Missing username');
        } catch (PasswordRequiredException $e) {
            return MessageController::Snackbar('Missing password');
        }
    }

}
