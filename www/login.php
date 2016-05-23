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

// This catches all exceptions and converts them to JSON so the client can read it
set_exception_handler(function (Exception $e) {
    $reflection = new ReflectionClass($e);
    $response = array(
        "status" => 'exception',
        "response" => $e->getMessage(),
        "code" => $e->getCode(),
        "type" => $reflection->getShortName()
    );
    echo json_encode($response);
});

function isBanned($username)
{
    $dbh = \Chat\Database::getInstance();
    $stmt = $dbh->prepare("SELECT reason FROM banned_users WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $username]);

    // Return the reason the user is banned or false
    return $stmt->fetch(PDO::FETCH_ASSOC)['reason'] ?: false;
}

// Create a default response which will be edited over the course of this script
$data = null;
$response = [
    'status' => 'failure',
    'response' => &$data
];

// We only want POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $data = 'Unexpected request method ' . $_SERVER['REQUEST_METHOD'];
    die(json_encode($response));
}

// Check if username and password are given
$username = $_POST['username'];
$password = $_POST['password'];

// Parse the ldap config and connect to the AD server
if (!file_exists(__DIR__ . '/../ldap.ini')) {
    throw new \Illuminate\Contracts\Filesystem\FileNotFoundException('Couldn\'t find ldap.ini');
}
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

        if (($banReason = isBanned($username)) !== false) {
            $response['type'] = 'ban';
            $data = "You are banned! \nReason: " . $banReason;
            echo json_encode($response);
            exit;
        }

        // Save some user information in the session
        $_SESSION['username'] = $username;
        $_SESSION['common_name'] = $user->getDisplayName();

        $response['status'] = 'success';
        $data['username'] = $username;
        $data['common_name'] = $user->getDisplayName();
    } else {
        $data = 'Invalid username or password';
    }
} catch (\Adldap\Exceptions\Auth\UsernameRequiredException $e) {
    $data = 'Missing username';
} catch (\Adldap\Exceptions\Auth\PasswordRequiredException $e) {
    $data = 'Missing password';
}

echo json_encode($response);
exit;