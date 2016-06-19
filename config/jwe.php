<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 6/14/16
 * Time: 2:37 PM
 */
return [
    'pass' => getenv('JWE_PASS'),
    'iss' => getenv('JWE_ISS'),
    'aud' => getenv('JWE_AUD'),
];
