<?php
/**
 * Wraps route params, query string, JSON body, and the authenticated
 * user (set by AuthMiddleware) for easy access in controllers.
 */

class Request
{
    public array $params;
    public array $query;
    public array $body;
    public ?array $user = null; // set by AuthMiddleware: ['id' => ..., 'role' => ...]

    public function __construct(array $params = [])
    {
        $this->params = $params;
        $this->query = $_GET ?? [];

        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw, true);
        $this->body = is_array($decoded) ? $decoded : [];
    }

    public function param(string $key, $default = null)
    {
        return $this->params[$key] ?? $default;
    }

    public function input(string $key, $default = null)
    {
        return $this->body[$key] ?? $default;
    }

    public function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? apache_request_headers()['Authorization']
            ?? '';

        if (preg_match('/Bearer\s+(\S+)/', $header, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
