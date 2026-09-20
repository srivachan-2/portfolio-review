<?php

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM users WHERE email = ?'
        );

        $stmt->execute([$email]);

        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, email, role, avatar, created_at
             FROM users
             WHERE id = ?'
        );

        $stmt->execute([$id]);

        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function create(
        string $name,
        string $email,
        string $passwordHash,
        string $role = 'submitter'
    ): int {
        $stmt = $this->db->prepare(
            'INSERT INTO users
            (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)'
        );

        $stmt->execute([
            $name,
            $email,
            $passwordHash,
            $role
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function emailExists(string $email): bool
    {
        $stmt = $this->db->prepare(
            'SELECT id
             FROM users
             WHERE email = ?'
        );

        $stmt->execute([$email]);

        return (bool) $stmt->fetch();
    }

    /**
     * Get all users for the admin panel.
     * Password hashes are intentionally excluded.
     */
    public function getAll(): array
    {
        $stmt = $this->db->query(
            'SELECT id, name, email, role, avatar, created_at
             FROM users
             ORDER BY created_at DESC'
        );

        return $stmt->fetchAll();
    }

    /**
     * Change a user's role.
     */
    public function updateRole(
        int $userId,
        string $role
    ): bool {
        $allowedRoles = [
            'submitter',
            'reviewer',
            'admin'
        ];

        if (!in_array($role, $allowedRoles, true)) {
            return false;
        }

        $stmt = $this->db->prepare(
            'UPDATE users
             SET role = ?
             WHERE id = ?'
        );

        $stmt->execute([
            $role,
            $userId
        ]);

        return $stmt->rowCount() > 0;
    }
}