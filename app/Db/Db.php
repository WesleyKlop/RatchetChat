<?php

namespace Chat\Db;

use Chat\Config\Config;
use FluentPDO;
use PDO;

final class Db
{
    /** @var PDO $pdo */
    private static $pdo;
    /** @var FluentPDO $fpdo */
    private static $fpdo;
    private static $options = [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'",
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ];

    /** @ignore */
    public function __construct()
    {

    }

    /**
     * @return FluentPDO
     */
    public static function getInstance()
    {
        self::getPdo();
        if (!(self::$fpdo instanceof FluentPDO)) {
            self::$fpdo = new FluentPDO(self::$pdo);
        }
        return self::$fpdo;
    }

    /**
     * @return PDO
     */
    public static function getPdo()
    {
        if (!(self::$pdo instanceof PDO)) {
            $dsn = Config::get('db.connection') . ':dbname=' . Config::get('db.database') . ';host=' . Config::get('db.host') . ';charset=UTF8;port=' . Config::get('db.port');
            self::$pdo = new PDO($dsn, Config::get('db.username'), Config::get('db.password'), self::$options);
        }
        return self::$pdo;
    }

    /** @ignore */
    public function __clone()
    {
    }
}
