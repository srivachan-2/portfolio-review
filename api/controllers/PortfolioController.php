<?php

class PortfolioController
{
    private Portfolio $portfolioModel;

    public function __construct()
    {
        $this->portfolioModel = new Portfolio();
    }

    public function store(Request $request): void
    {
        $title = trim($request->input('title', ''));
        $description = $request->input('description', '');
        $link = trim($request->input('link', ''));
        $category = $request->input('category');
        $tags = $request->input('tags', []);

        if (!$title || !$link) {
            Response::error('Title and link are required.', 422);
        }

        if (!filter_var($link, FILTER_VALIDATE_URL)) {
            Response::error('Link must be a valid URL.', 422);
        }

        $portfolioId = $this->portfolioModel->create(
            $request->user['id'],
            $title,
            $description,
            $link,
            $category,
            is_array($tags) ? $tags : []
        );

        $portfolio = $this->portfolioModel->findById($portfolioId);
        Response::success($portfolio, 'Portfolio submitted successfully.', 201);
    }

    public function index(Request $request): void
    {
        $page = max(1, (int) ($request->query['page'] ?? 1));
        $perPage = min(50, max(1, (int) ($request->query['perPage'] ?? 12)));

        $filters = array_filter([
            'category' => $request->query['category'] ?? null,
            'status' => $request->query['status'] ?? null,
            'tag' => $request->query['tag'] ?? null,
        ]);

        $result = $this->portfolioModel->list($filters, $page, $perPage);
        Response::success($result);
    }

    public function show(Request $request): void
    {
        $portfolio = $this->portfolioModel->findById((int) $request->param('id'));

        if (!$portfolio) {
            Response::error('Portfolio not found.', 404);
        }

        Response::success($portfolio);
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        $portfolio = $this->portfolioModel->findById($id);

        if (!$portfolio) {
            Response::error('Portfolio not found.', 404);
        }

        $isOwner = (int) $portfolio['user_id'] === (int) $request->user['id'];
        $isAdmin = $request->user['role'] === 'admin';

        if (!$isOwner && !$isAdmin) {
            Response::error('Forbidden: not your portfolio.', 403);
        }

        $fields = array_filter([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'link' => $request->input('link'),
            'category' => $request->input('category'),
            'status' => $isAdmin ? $request->input('status') : null,
        ], fn ($v) => $v !== null);

        if (!empty($fields)) {
            $this->portfolioModel->update($id, $fields);
        }

        if ($request->input('tags') !== null) {
            $this->portfolioModel->syncTags($id, $request->input('tags'));
        }

        // Resubmission: content changed materially -> bump version, reset to pending.
        if ($isOwner && $request->input('resubmit') === true) {
            $this->portfolioModel->incrementVersion($id);
        }

        Response::success($this->portfolioModel->findById($id), 'Portfolio updated.');
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param('id');
        $portfolio = $this->portfolioModel->findById($id);

        if (!$portfolio) {
            Response::error('Portfolio not found.', 404);
        }

        $isOwner = (int) $portfolio['user_id'] === (int) $request->user['id'];
        $isAdmin = $request->user['role'] === 'admin';

        if (!$isOwner && !$isAdmin) {
            Response::error('Forbidden: not your portfolio.', 403);
        }

        $this->portfolioModel->delete($id);
        Response::success(null, 'Portfolio deleted.');
    }

    public function myPortfolios(Request $request): void
    {
        $result = $this->portfolioModel->list(['user_id' => $request->user['id']], 1, 100);
        Response::success($result);
    }

    /** Public: list a specific user's submitted portfolios. */
    public function byUser(Request $request): void
    {
        $userId = (int) $request->param('id');
        $result = $this->portfolioModel->list(['user_id' => $userId], 1, 100);
        Response::success($result);
    }
}
