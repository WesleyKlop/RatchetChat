<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 20-5-16
 * Time: 15:57
 */
use Adldap\Adldap;
use Adldap\Connections\Provider;
use Adldap\Models\User;
use Adldap\Query\Builder;

session_start();
// We don't want to cache anything and let the user know the content is JSON
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 29 dec 1997 17:00:00 GMT');
header('Content-type: application/json');

require_once __DIR__ . '/../vendor/autoload.php';

// Create a default response which will be edited over the course of this script
$return = null;
$response = [
    'status' => 'failure',
    'response' => &$return
];

// We only want POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $return = 'Unexpected request method ' . $_SERVER['REQUEST_METHOD'];
    die(json_encode($response));
}

// Check if username and password are given
$username = $_POST['username'];
$password = $_POST['password'];

// Parse the ldap config and connect to the AD server
$config = parse_ini_file(__DIR__ . '/../ldap.ini');
// Create provider and AdLdap
$adProvider = new Provider($config);
$adLdap = new Adldap();
// Bind provider
$adLdap->addProvider('default', $adProvider);
// Connect to the provider
$adLdap->connect('default');

// Try authenticating
try {
    if ($adProvider->auth()->attempt($username, $password, true)) {
        // Successfully authenticated, get the user information
        /** @var Builder $search */
        $search = $adProvider->search();
        /** @var User $user */
        $user = $search->find($username);

        // Save some user information in the session
        $_SESSION['username'] = $username;
        $_SESSION['common_name'] = $user->getDisplayName();

        $response['status'] = 'success';
        $return['username'] = $username;
        $return['common_name'] = $user->getDisplayName();
    } else {
        $return = 'Invalid username or password';
    }
} catch (\Adldap\Exceptions\Auth\UsernameRequiredException $e) {
    $return = $_POST;
} catch (\Adldap\Exceptions\Auth\PasswordRequiredException $e) {
    $return = 'Missing password';
}

echo json_encode($response);