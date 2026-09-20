<?php

/**
 * Minimal router:
 * Matches HTTP method + path (with :param placeholders)
 * to a [ControllerClass, 'method'] callable,
 * with optional middleware.
 */
class Router
{
    private array $routes = [];

    public function get(
        string $path,
        array $action,
        array $middleware = []
    ): void {
        $this->add('GET', $path, $action, $middleware);
    }

    public function post(
        string $path,
        array $action,
        array $middleware = []
    ): void {
        $this->add('POST', $path, $action, $middleware);
    }

    public function put(
        string $path,
        array $action,
        array $middleware = []
    ): void {
        $this->add('PUT', $path, $action, $middleware);
    }

    public function delete(
        string $path,
        array $action,
        array $middleware = []
    ): void {
        $this->add('DELETE', $path, $action, $middleware);
    }

    private function add(
        string $method,
        string $path,
        array $action,
        array $middleware
    ): void {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'action' => $action,
            'middleware' => $middleware
        ];
    }

    private function match(
        string $routePath,
        string $requestPath,
        array &$params
    ): bool {
        $routeParts = explode('/', trim($routePath, '/'));
        $requestParts = explode('/', trim($requestPath, '/'));

        if (count($routeParts) !== count($requestParts)) {
            return false;
        }

        foreach ($routeParts as $i => $part) {

            // Dynamic parameter, e.g. :id
            if (str_starts_with($part, ':')) {
                $paramName = substr($part, 1);
                $params[$paramName] = $requestParts[$i];
            }

            // Normal route segment
            elseif ($part !== $requestParts[$i]) {
                return false;
            }
        }

        return true;
    }

    public function dispatch(
        string $method,
        string $path
    ): void {

        /*
         * Example browser request:
         *
         * /portfolio-review/api/portfolios
         *
         * $_SERVER['SCRIPT_NAME']:
         * /portfolio-review/api/index.php
         *
         * The routes inside index.php are:
         *
         * /api/portfolios
         *
         * So we need to remove:
         *
         * /portfolio-review
         *
         * from the request path.
         */

        $path = parse_url($path, PHP_URL_PATH);

        if (!$path) {
            $path = '/';
        }

        $scriptName = str_replace(
            '\\',
            '/',
            $_SERVER['SCRIPT_NAME'] ?? ''
        );

        /*
         * /portfolio-review/api/index.php
         *              ↓
         * /portfolio-review/api
         */
        $apiDirectory = dirname($scriptName);

        /*
         * /portfolio-review/api
         *              ↓
         * /portfolio-review
         */
        $projectDirectory = dirname($apiDirectory);

        $projectDirectory = rtrim(
            str_replace('\\', '/', $projectDirectory),
            '/'
        );

        /*
         * Remove project directory.
         *
         * Before:
         * /portfolio-review/api/portfolios
         *
         * After:
         * /api/portfolios
         */
        if (
            $projectDirectory !== '' &&
            $projectDirectory !== '/' &&
            str_starts_with($path, $projectDirectory)
        ) {
            $path = substr(
                $path,
                strlen($projectDirectory)
            );
        }

        $path = '/' . ltrim($path, '/');

        /*
         * Try every registered route.
         */
        foreach ($this->routes as $route) {

            if ($route['method'] !== $method) {
                continue;
            }

            $params = [];

            if (
                $this->match(
                    $route['path'],
                    $path,
                    $params
                )
            ) {

                /*
                 * Create Request object.
                 */
                $request = new Request($params);

                /*
                 * Run middleware.
                 */
                foreach ($route['middleware'] as $middleware) {

                    if (is_array($middleware)) {

                        [$middlewareClass, $args] = $middleware;

                        $middlewareInstance =
                            new $middlewareClass(...$args);

                    } else {

                        $middlewareInstance =
                            new $middleware();
                    }

                    $middlewareInstance->handle($request);
                }

                /*
                 * Run controller action.
                 */
                [
                    $controllerClass,
                    $methodName
                ] = $route['action'];

                $controller =
                    new $controllerClass();

                $controller->$methodName($request);

                return;
            }
        }

        /*
         * No route matched.
         */
        Response::json(
            [
                'success' => false,
                'message' => 'Route not found'
            ],
            404
        );
    }
}