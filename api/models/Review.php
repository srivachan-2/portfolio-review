<?php

class Review
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(int $portfolioId, int $reviewerId, array $scores, string $comment): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO reviews
                (portfolio_id, reviewer_id, author_type, ai_model, score_creativity, score_technical, score_presentation, score_overall, comment)
             VALUES (?, ?, "human", NULL, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $portfolioId,
            $reviewerId,
            $scores['creativity'],
            $scores['technical'],
            $scores['presentation'],
            $scores['overall'],
            $comment,
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Stores an AI-generated review. No reviewer_id (no human account behind it) —
     * author_type + ai_model make the provenance explicit everywhere the review is read.
     */
    public function createAIReview(int $portfolioId, array $scores, string $comment, string $aiModel): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO reviews
                (portfolio_id, reviewer_id, author_type, ai_model, score_creativity, score_technical, score_presentation, score_overall, comment)
             VALUES (?, NULL, "ai", ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $portfolioId,
            $aiModel,
            $scores['creativity'],
            $scores['technical'],
            $scores['presentation'],
            $scores['overall'],
            $comment,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM reviews WHERE id = ?');
        $stmt->execute([$id]);
        $review = $stmt->fetch();
        return $review ?: null;
    }

    /**
     * Full structured + chronological feedback history for a portfolio.
     */
    public function getHistoryForPortfolio(int $portfolioId): array
    {
        $stmt = $this->db->prepare(
            'SELECT r.*, COALESCE(u.name, "AI Reviewer") AS reviewer_name
             FROM reviews r
             LEFT JOIN users u ON u.id = r.reviewer_id
             WHERE r.portfolio_id = ?
             ORDER BY r.created_at ASC'
        );
        $stmt->execute([$portfolioId]);
        return $stmt->fetchAll();
    }

    public function update(int $id, array $scores, string $comment): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE reviews SET
                score_creativity = ?, score_technical = ?, score_presentation = ?,
                score_overall = ?, comment = ?
             WHERE id = ?'
        );
        return $stmt->execute([
            $scores['creativity'],
            $scores['technical'],
            $scores['presentation'],
            $scores['overall'],
            $comment,
            $id,
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM reviews WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function isReviewer(int $reviewId, int $userId): bool
    {
        $stmt = $this->db->prepare('SELECT id FROM reviews WHERE id = ? AND reviewer_id = ?');
        $stmt->execute([$reviewId, $userId]);
        return (bool) $stmt->fetch();
    }

    public function hasAlreadyReviewed(int $portfolioId, int $reviewerId): bool
    {
        $stmt = $this->db->prepare('SELECT id FROM reviews WHERE portfolio_id = ? AND reviewer_id = ?');
        $stmt->execute([$portfolioId, $reviewerId]);
        return (bool) $stmt->fetch();
    }

    public function getByReviewer(int $reviewerId): array
    {
        $stmt = $this->db->prepare(
            'SELECT r.*, p.title AS portfolio_title
             FROM reviews r
             JOIN portfolios p ON p.id = r.portfolio_id
             WHERE r.reviewer_id = ?
             ORDER BY r.created_at DESC'
        );
        $stmt->execute([$reviewerId]);
        return $stmt->fetchAll();
    }
}
