<?php

class AuthController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function register(Request $request): void
    {
        $name = trim($request->input('name', ''));
        $email = trim(strtolower($request->input('email', '')));
        $password = $request->input('password', '');

        /*
         * IMPORTANT:
         * Public registration always creates a submitter.
         *
         * Users cannot choose reviewer/admin during registration.
         * Reviewer and admin roles must be assigned separately.
         */
        $role = 'submitter';

        if (!$name || !$email || !$password) {
            Response::error(
                'Name, email, and password are required.',
                422
            );
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error(
                'Invalid email address.',
                422
            );
        }

        if (strlen($password) < 8) {
            Response::error(
                'Password must be at least 8 characters.',
                422
            );
        }

        if ($this->userModel->emailExists($email)) {
            Response::error(
                'An account with this email already exists.',
                409
            );
        }

        $hash = password_hash(
            $password,
            PASSWORD_BCRYPT
        );

        $userId = $this->userModel->create(
            $name,
            $email,
            $hash,
            $role
        );

        $token = Auth::generateToken([
            'id' => $userId,
            'role' => $role
        ]);

        Response::success([
            'token' => $token,
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'role' => $role
            ],
        ], 'Registered successfully.', 201);
    }

    public function login(Request $request): void
    {
        $email = trim(
            strtolower(
                $request->input('email', '')
            )
        );

        $password =
            $request->input('password', '');

        if (!$email || !$password) {
            Response::error(
                'Email and password are required.',
                422
            );
        }

        $user =
            $this->userModel->findByEmail($email);

        if (
            !$user ||
            !password_verify(
                $password,
                $user['password_hash']
            )
        ) {
            Response::error(
                'Invalid credentials.',
                401
            );
        }

        $token = Auth::generateToken([
            'id' => (int) $user['id'],
            'role' => $user['role']
        ]);

        Response::success([
            'token' => $token,
            'user' => [
                'id' => (int) $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
            ],
        ], 'Logged in successfully.');
    }

    public function me(Request $request): void
    {
        $user =
            $this->userModel->findById(
                $request->user['id']
            );

        if (!$user) {
            Response::error(
                'User not found.',
                404
            );
        }

        Response::success($user);
    }
}