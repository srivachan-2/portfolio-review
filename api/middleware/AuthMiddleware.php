<?php
/**
 * Verifies the Bearer JWT on protected routes and attaches the
 * decoded user (id, role) to the Request object.
 */

class AuthMiddleware
{
    public function handle(Request $request): void
    {
        $token = $request->bearerToken();
        $payload = Auth::verifyToken($token);

        if (!$payload) {
            Response::error('Unauthorized: invalid or missing token', 401);
        }

        $request->user = [
            'id' => $payload['id'],
            'role' => $payload['role'],
        ];
    }
}
