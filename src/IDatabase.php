<?php
/**
 * Created by PhpStorm.
 * User: wesley
 * Date: 23-5-16
 * Time: 11:14
 */

namespace Chat;


use PDOStatement;

interface IDatabase
{
    /**
     * Returns a PDO instance
     * @return \PDO
     */
    public static function getInstance();

    /**
     * Queries the Database
     * @param string $sql the sql query to execute
     * @param int $mode Fetch mode
     * @return PDOStatement
     */
    public static function query($sql, $mode = \PDO::ATTR_DEFAULT_FETCH_MODE);

    /**
     * The same as doing IDatabase::getInstance()->prepare($sql)
     * @param string $sql
     * @return PDOStatement
     */
    public static function prepare($sql);
}