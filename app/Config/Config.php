<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 6/2/16
 * Time: 9:48 PM
 */

namespace Chat\Config;

use Dotenv\Dotenv;

class Config
{
    /**
     * @var string CONF_PATH
     */
    const CONF_PATH = __DIR__ . '/../../config';
    public static $config = [];

    /**
     * @param string $key they key path delimited with periods .
     * @return string
     */
    public static function get($key)
    {
        if (empty(self::$config))
            self::load();

        $keys = explode('.', $key);

        $tmp = self::$config;
        foreach ($keys as $value) {
            $tmp = $tmp[$value];
        }

        return $tmp;
    }

    private static function load()
    {
        // Load dotenv
        (new Dotenv(__DIR__ . '/../../'))->load();

        /** @noinspection PhpIncludeInspection */
        self::$config = [
            "db" => require self::CONF_PATH . '/database.php',
            "ldap" => require self::CONF_PATH . '/ldap.php',
            "app" => require self::CONF_PATH . '/app.php',
        ];
    }
}