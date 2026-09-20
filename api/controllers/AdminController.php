<?php

class AdminController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    /**
     * Get all users.
     * Admin only.
     */
    public function users(Request $request): void
    {
        Response::success(
            $this->userModel->getAll()
        );
    }

    /**
     * Change a user's role.
     * Admin only.
     */
    public function updateUserRole(Request $request): void
    {
        $userId = (int) $request->param('id');
        $role = trim(
            strtolower(
                $request->input('role', '')
            )
        );

        if ($userId <= 0) {
            Response::error(
                'Invalid user ID.',
                422
            );
        }

        if (!in_array(
            $role,
            ['submitter', 'reviewer'],
            true
        )) {
            Response::error(
                'Role must be submitter or reviewer.',
                422
            );
        }

        /*
         * Prevent an admin from accidentally changing
         * their own account through this endpoint.
         */
        if (
            $userId ===
            (int) $request->user['id']
        ) {
            Response::error(
                'You cannot change your own role.',
                403
            );
        }

        $user =
            $this->userModel->findById($userId);

        if (!$user) {
            Response::error(
                'User not found.',
                404
            );
        }

        $updated =
            $this->userModel->updateRole(
                $userId,
                $role
            );

        if (!$updated) {
            Response::error(
                'Could not update user role.',
                500
            );
        }

        Response::success(
            $this->userModel->findById($userId),
            'User role updated successfully.'
        );
    }
}