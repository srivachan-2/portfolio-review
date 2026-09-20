<?php

/**
 * PDO Database connection for local XAMPP (MySQL).
 * Default XAMPP MySQL credentials: user "root", empty password.
 *
 * Environment variables (DB_HOST, DB_NAME, etc.) still override these
 * defaults if you ever deploy this elsewhere — but for local dev, the
 * fallback values below are all you need.
 */

class Database
{
    private static ?PDO $connection = null;

    public static function getConnection(): PDO
    {
        if (self::$connection === null) {

            $host = getenv('DB_HOST') ?: 'localhost';
            $port = getenv('DB_PORT') ?: '3306';
            $dbname = getenv('DB_NAME') ?: 'portfolio_review';
            $user = getenv('DB_USER') ?: 'root';
            $pass = getenv('DB_PASSWORD') ?: '';
            $charset = 'utf8mb4';

            $dsn =
                "mysql:host={$host};" .
                "port={$port};" .
                "dbname={$dbname};" .
                "charset={$charset}";

            $options = [
                PDO::ATTR_ERRMODE =>
                    PDO::ERRMODE_EXCEPTION,

                PDO::ATTR_DEFAULT_FETCH_MODE =>
                    PDO::FETCH_ASSOC,

                PDO::ATTR_EMULATE_PREPARES =>
                    false,
            ];

            try {

                self::$connection = new PDO(
                    $dsn,
                    $user,
                    $pass,
                    $options
                );

            } catch (PDOException $e) {

                http_response_code(500);

                echo json_encode([
                    'success' => false,
                    'message' =>
                        'Database connection failed.'
                ]);

                exit;
            }
        }

        return self::$connection;
    }
}