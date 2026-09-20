<?php
/**
 * Restricts a route to one or more roles. Must run AFTER AuthMiddleware
 * (so $request->user is already populated).
 *
 * Usage in routes: [RoleMiddleware::class, [['admin', 'reviewer']]]
 */

class RoleMiddleware
{
    private array $allowedRoles;

    public function __construct(array $allowedRoles)
    {
        $this->allowedRoles = $allowedRoles;
    }

    public function handle(Request $request): void
    {
        if (!$request->user || !in_array($request->user['role'], $this->allowedRoles, true)) {
            Response::error('Forbidden: insufficient permissions', 403);
        }
    }
}
