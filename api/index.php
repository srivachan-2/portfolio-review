<?php

/**
 * Front controller / entry point.
 * With mod_rewrite (.htaccess) enabled, every request to
 *   http://localhost/portfolio-review/api/...
 * is routed here.
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';

require_once __DIR__ . '/core/Request.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/Auth.php';
require_once __DIR__ . '/core/Router.php';

require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/middleware/RoleMiddleware.php';

require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Portfolio.php';
require_once __DIR__ . '/models/Review.php';

require_once __DIR__ . '/config/ai.php';
require_once __DIR__ . '/services/AIReviewService.php';

require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/PortfolioController.php';
require_once __DIR__ . '/controllers/ReviewController.php';
require_once __DIR__ . '/controllers/AdminController.php';

$router = new Router();

/* ---------------------------------------------------------------- *
 * Auth routes (public)
 * ---------------------------------------------------------------- */
$router->post(
    '/api/auth/register',
    [AuthController::class, 'register']
);

$router->post(
    '/api/auth/login',
    [AuthController::class, 'login']
);

$router->get(
    '/api/auth/me',
    [AuthController::class, 'me'],
    [AuthMiddleware::class]
);


/* ---------------------------------------------------------------- *
 * Portfolio routes
 * ---------------------------------------------------------------- */

// Public browse
$router->get(
    '/api/portfolios',
    [PortfolioController::class, 'index']
);

// Public portfolio detail
$router->get(
    '/api/portfolios/:id',
    [PortfolioController::class, 'show']
);

// Authenticated users
$router->post(
    '/api/portfolios',
    [PortfolioController::class, 'store'],
    [AuthMiddleware::class]
);

$router->put(
    '/api/portfolios/:id',
    [PortfolioController::class, 'update'],
    [AuthMiddleware::class]
);

$router->delete(
    '/api/portfolios/:id',
    [PortfolioController::class, 'destroy'],
    [AuthMiddleware::class]
);

$router->get(
    '/api/my/portfolios',
    [PortfolioController::class, 'myPortfolios'],
    [AuthMiddleware::class]
);


/* ---------------------------------------------------------------- *
 * Review routes
 * ---------------------------------------------------------------- */

// Public review history
$router->get(
    '/api/portfolios/:id/reviews',
    [ReviewController::class, 'historyForPortfolio']
);

// Only reviewer/admin can submit human reviews
$router->post(
    '/api/portfolios/:id/reviews',
    [ReviewController::class, 'store'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            [['reviewer', 'admin']]
        ]
    ]
);

// Public review details
$router->get(
    '/api/reviews/:id',
    [ReviewController::class, 'show']
);

// Optional AI review.
// Any authenticated user may request an AI review.
$router->post(
    '/api/portfolios/:id/ai-review',
    [ReviewController::class, 'generateAIReview'],
    [AuthMiddleware::class]
);

// Only reviewer/admin can edit human reviews
$router->put(
    '/api/reviews/:id',
    [ReviewController::class, 'update'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            [['reviewer', 'admin']]
        ]
    ]
);

// Authenticated reviewer/admin can delete reviews
$router->delete(
    '/api/reviews/:id',
    [ReviewController::class, 'destroy'],
    [AuthMiddleware::class]
);

// Reviews created by current user
$router->get(
    '/api/my/reviews',
    [ReviewController::class, 'myReviews'],
    [AuthMiddleware::class]
);


/* ---------------------------------------------------------------- *
 * User routes
 * ---------------------------------------------------------------- */

// Public portfolios belonging to a user
$router->get(
    '/api/users/:id/portfolios',
    [PortfolioController::class, 'byUser']
);


/* ---------------------------------------------------------------- *
 * Admin routes
 * ---------------------------------------------------------------- */

// Get all users.
// Admin only.
$router->get(
    '/api/admin/users',
    [AdminController::class, 'users'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            [['admin']]
        ]
    ]
);

// Change a user's role.
// Admin only.
$router->put(
    '/api/admin/users/:id/role',
    [AdminController::class, 'updateUserRole'],
    [
        AuthMiddleware::class,
        [
            RoleMiddleware::class,
            [['admin']]
        ]
    ]
);


/* ---------------------------------------------------------------- *
 * Dispatch
 * ---------------------------------------------------------------- *
 * When this project lives in a subfolder under htdocs (e.g.
 * htdocs/portfolio-review-2ai/api/index.php), REQUEST_URI includes
 * that subfolder: /portfolio-review-2ai/api/portfolios. But our routes
 * are only defined as /api/portfolios. So we compute the install
 * folder from SCRIPT_NAME and strip it, leaving just /api/portfolios
 * to match against — regardless of what you name the folder.
 */

$installRoot = dirname(dirname($_SERVER['SCRIPT_NAME']));
if ($installRoot === '/' || $installRoot === '\\' || $installRoot === '.') {
    $installRoot = '';
}

$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($installRoot !== '' && str_starts_with($requestPath, $installRoot)) {
    $requestPath = substr($requestPath, strlen($installRoot));
}

$requestMethod =
    $_SERVER['REQUEST_METHOD'];

$router->dispatch(
    $requestMethod,
    $requestPath
);