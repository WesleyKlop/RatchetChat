<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 6/14/16
 * Time: 2:37 PM
 */
return [
    'key' => getenv('JWT_KEY'),
    'iss' => getenv('JWT_ISS'),
    'aud' => getenv('JWT_AUD'),
];
