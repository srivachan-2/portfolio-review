<?php

class ReviewController
{
    private Review $reviewModel;
    private Portfolio $portfolioModel;

    public function __construct()
    {
        $this->reviewModel = new Review();
        $this->portfolioModel = new Portfolio();
    }

    /**
     * Optional AI review: any authenticated user can trigger it for any
     * portfolio (including their own — the "don't review your own work"
     * rule only applies to human reviewers, since AI has no self-interest
     * to police). Stored exactly like a human review except author_type/ai_model.
     */
    public function generateAIReview(Request $request): void
    {
        $portfolioId = (int) $request->param('id');
        $portfolio = $this->portfolioModel->findById($portfolioId);

        if (!$portfolio) {
            Response::error('Portfolio not found.', 404);
        }

        try {
            $aiService = new AIReviewService();
            $result = $aiService->review($portfolio);
        } catch (AIReviewException $e) {
            Response::error($e->getMessage(), 502);
            return;
        }

        $reviewId = $this->reviewModel->createAIReview(
            $portfolioId,
            $result['scores'],
            $result['comment'],
            $result['model']
        );
        $this->portfolioModel->refreshAggregates($portfolioId);

        Response::success($this->reviewModel->findById($reviewId), 'AI review generated.', 201);
    }

    public function store(Request $request): void
    {
        $portfolioId = (int) $request->param('id');
        $portfolio = $this->portfolioModel->findById($portfolioId);

        if (!$portfolio) {
            Response::error('Portfolio not found.', 404);
        }

        if ((int) $portfolio['user_id'] === (int) $request->user['id']) {
            Response::error('You cannot review your own portfolio.', 403);
        }

        if ($this->reviewModel->hasAlreadyReviewed($portfolioId, $request->user['id'])) {
            Response::error('You have already reviewed this portfolio. Edit your existing review instead.', 409);
        }

        $scores = $this->validateScores($request);
        $comment = trim($request->input('comment', ''));

        if (!$comment) {
            Response::error('A comment is required alongside the scores.', 422);
        }

        $reviewId = $this->reviewModel->create($portfolioId, $request->user['id'], $scores, $comment);
        $this->portfolioModel->refreshAggregates($portfolioId);

        Response::success($this->reviewModel->findById($reviewId), 'Review submitted.', 201);
    }

    /** Full structured + chronological feedback history for a portfolio. */
    public function historyForPortfolio(Request $request): void
    {
        $portfolioId = (int) $request->param('id');
        $portfolio = $this->portfolioModel->findById($portfolioId);

        if (!$portfolio) {
            Response::error('Portfolio not found.', 404);
        }

        Response::success([
            'portfolio' => $portfolio,
            'history' => $this->reviewModel->getHistoryForPortfolio($portfolioId),
        ]);
    }

    public function show(Request $request): void
    {
        $review = $this->reviewModel->findById((int) $request->param('id'));

        if (!$review) {
            Response::error('Review not found.', 404);
        }

        Response::success($review);
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        $review = $this->reviewModel->findById($id);

        if (!$review) {
            Response::error('Review not found.', 404);
        }

        $isReviewer = (int) $review['reviewer_id'] === (int) $request->user['id'];
        $isAdmin = $request->user['role'] === 'admin';

        if (!$isReviewer && !$isAdmin) {
            Response::error('Forbidden: not your review.', 403);
        }

        $scores = $this->validateScores($request);
        $comment = trim($request->input('comment', $review['comment']));

        $this->reviewModel->update($id, $scores, $comment);
        $this->portfolioModel->refreshAggregates((int) $review['portfolio_id']);

        Response::success($this->reviewModel->findById($id), 'Review updated.');
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param('id');
        $review = $this->reviewModel->findById($id);

        if (!$review) {
            Response::error('Review not found.', 404);
        }

        $isReviewer = (int) $review['reviewer_id'] === (int) $request->user['id'];
        $isAdmin = $request->user['role'] === 'admin';

        if (!$isReviewer && !$isAdmin) {
            Response::error('Forbidden: not your review.', 403);
        }

        $this->reviewModel->delete($id);
        $this->portfolioModel->refreshAggregates((int) $review['portfolio_id']);

        Response::success(null, 'Review deleted.');
    }

    public function myReviews(Request $request): void
    {
        Response::success($this->reviewModel->getByReviewer($request->user['id']));
    }

    private function validateScores(Request $request): array
    {
        $keys = ['creativity', 'technical', 'presentation', 'overall'];
        $scores = [];

        foreach ($keys as $key) {
            $value = $request->input($key);
            if ($value === null || !is_numeric($value) || $value < 1 || $value > 10) {
                Response::error("Score '{$key}' is required and must be a number between 1 and 10.", 422);
            }
            $scores[$key] = (int) $value;
        }

        return $scores;
    }
}
