<?php

class Portfolio
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(int $userId, string $title, ?string $description, string $link, ?string $category, array $tags = []): int
    {
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                'INSERT INTO portfolios (user_id, title, description, link, category) VALUES (?, ?, ?, ?, ?)'
            );
            $stmt->execute([$userId, $title, $description, $link, $category]);
            $portfolioId = (int) $this->db->lastInsertId();

            $this->syncTags($portfolioId, $tags);

            $this->db->commit();
            return $portfolioId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function syncTags(int $portfolioId, array $tags): void
    {
        $del = $this->db->prepare('DELETE FROM portfolio_tags WHERE portfolio_id = ?');
        $del->execute([$portfolioId]);

        if (empty($tags)) {
            return;
        }

        $stmt = $this->db->prepare('INSERT INTO portfolio_tags (portfolio_id, tag) VALUES (?, ?)');
        foreach ($tags as $tag) {
            $tag = trim($tag);
            if ($tag !== '') {
                $stmt->execute([$portfolioId, $tag]);
            }
        }
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT p.*, u.name AS owner_name, u.email AS owner_email
             FROM portfolios p
             JOIN users u ON u.id = p.user_id
             WHERE p.id = ?'
        );
        $stmt->execute([$id]);
        $portfolio = $stmt->fetch();

        if (!$portfolio) {
            return null;
        }

        $portfolio['tags'] = $this->getTags($id);
        return $portfolio;
    }

    public function getTags(int $portfolioId): array
    {
        $stmt = $this->db->prepare('SELECT tag FROM portfolio_tags WHERE portfolio_id = ?');
        $stmt->execute([$portfolioId]);
        return array_column($stmt->fetchAll(), 'tag');
    }

    /**
     * List portfolios with optional filters + pagination.
     */
    public function list(array $filters = [], int $page = 1, int $perPage = 12): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['category'])) {
            $where[] = 'p.category = ?';
            $params[] = $filters['category'];
        }
        if (!empty($filters['status'])) {
            $where[] = 'p.status = ?';
            $params[] = $filters['status'];
        }
        if (!empty($filters['user_id'])) {
            $where[] = 'p.user_id = ?';
            $params[] = $filters['user_id'];
        }
        if (!empty($filters['tag'])) {
            $where[] = 'p.id IN (SELECT portfolio_id FROM portfolio_tags WHERE tag = ?)';
            $params[] = $filters['tag'];
        }

        $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';
        $offset = ($page - 1) * $perPage;

        $countStmt = $this->db->prepare("SELECT COUNT(*) AS total FROM portfolios p {$whereSql}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetch()['total'];

        $sql = "SELECT p.*, u.name AS owner_name
                FROM portfolios p
                JOIN users u ON u.id = p.user_id
                {$whereSql}
                ORDER BY p.created_at DESC
                LIMIT {$perPage} OFFSET {$offset}";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        foreach ($items as &$item) {
            $item['tags'] = $this->getTags((int) $item['id']);
        }

        return [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
            'totalPages' => (int) ceil($total / $perPage),
        ];
    }

    public function update(int $id, array $fields): bool
    {
        $allowed = ['title', 'description', 'link', 'category', 'status'];
        $set = [];
        $params = [];

        foreach ($fields as $key => $value) {
            if (in_array($key, $allowed, true)) {
                $set[] = "{$key} = ?";
                $params[] = $value;
            }
        }

        if (empty($set)) {
            return false;
        }

        $params[] = $id;
        $stmt = $this->db->prepare('UPDATE portfolios SET ' . implode(', ', $set) . ' WHERE id = ?');
        return $stmt->execute($params);
    }

    public function incrementVersion(int $id): void
    {
        $stmt = $this->db->prepare('UPDATE portfolios SET version = version + 1, status = "pending" WHERE id = ?');
        $stmt->execute([$id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM portfolios WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function isOwner(int $portfolioId, int $userId): bool
    {
        $stmt = $this->db->prepare('SELECT id FROM portfolios WHERE id = ? AND user_id = ?');
        $stmt->execute([$portfolioId, $userId]);
        return (bool) $stmt->fetch();
    }

    /**
     * Recompute and store cached average scores + review count.
     * Call this after any review is created/updated/deleted.
     */
    public function refreshAggregates(int $portfolioId): void
    {
        $stmt = $this->db->prepare(
            'SELECT
                AVG(score_creativity) AS avg_creativity,
                AVG(score_technical) AS avg_technical,
                AVG(score_presentation) AS avg_presentation,
                AVG(score_overall) AS avg_overall,
                COUNT(*) AS review_count
             FROM reviews WHERE portfolio_id = ?'
        );
        $stmt->execute([$portfolioId]);
        $agg = $stmt->fetch();

        $status = ((int) $agg['review_count']) > 0 ? 'reviewed' : 'pending';

        $update = $this->db->prepare(
            'UPDATE portfolios SET
                avg_creativity = ?, avg_technical = ?, avg_presentation = ?,
                avg_overall = ?, review_count = ?, status = ?
             WHERE id = ?'
        );
        $update->execute([
            $agg['avg_creativity'],
            $agg['avg_technical'],
            $agg['avg_presentation'],
            $agg['avg_overall'],
            $agg['review_count'],
            $status,
            $portfolioId,
        ]);
    }
}
