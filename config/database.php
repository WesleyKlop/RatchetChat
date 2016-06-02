<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 6/2/16
 * Time: 8:54 PM
 */
return [
    'connection' => getenv('DB_CONNECTION'),
    'host' => getenv('DB_HOST'),
    'port' => getenv('DB_PORT'),
    'database' => getenv('DB_DATABASE'),
    'username' => getenv('DB_USERNAME'),
    'password' => getenv('DB_PASSWORD'),
];