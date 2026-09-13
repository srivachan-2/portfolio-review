# Portfolio Review Platform

Submit portfolio links/projects and receive structured review scores, comments,
and historical feedback.

**Stack:** React (Vite) frontend + Plain PHP/PDO REST API on XAMPP (Apache + MySQL).

---

## 1. Backend Setup (XAMPP)

1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Copy the `api/` folder into your XAMPP `htdocs` directory so the path is:
   ```
   C:/xampp/htdocs/portfolio-review/api/   (Windows)
   /Applications/XAMPP/htdocs/portfolio-review/api/   (Mac)
   /opt/lampp/htdocs/portfolio-review/api/   (Linux)
   ```
   (You can rename `portfolio-review` to whatever you like — just update the
   `BASE_URL` in `client/src/api/api.js` to match.)
3. Make sure Apache's `mod_rewrite` module is enabled (it is by default in
   XAMPP) so `.htaccess` works.
4. Import the database: open **phpMyAdmin** (`http://localhost/phpmyadmin`),
   create/import using `sql/schema.sql` (it creates the `portfolio_review`
   database and all tables for you — just run the whole file as an SQL query,
   or use Import).
5. Check `api/config/database.php` — defaults are `host=localhost, user=root,
   password=""`, which matches a fresh XAMPP install. Update if your MySQL
   root user has a password.
6. Test it's alive: visit
   `http://localhost/portfolio-review/api/api/portfolios`
   (adjust based on your folder name) — you should get a JSON response like
   `{"success":true,...}`.

   > Note: because `index.php` lives inside `api/`, and the router itself
   > matches paths starting with `/api/...`, the full URL ends up being
   > `http://localhost/<your-folder>/api/api/portfolios`. If you'd rather have
   > clean URLs like `http://localhost/portfolio-review/api/portfolios`, just
   > move the contents of `api/` up one level so `index.php` sits directly at
   > `htdocs/portfolio-review/index.php`, and update `BASE_URL` in the React
   > client to `http://localhost/portfolio-review`.

### Auth secret
Open `api/core/Auth.php` and change `SECRET` to your own long random string
before using this for anything beyond local development.

---

## 2. Frontend Setup (React)

```bash
cd client
npm install
npm run dev
```

This starts the Vite dev server at `http://localhost:5173`. Update
`client/src/api/api.js` → `BASE_URL` if your PHP API isn't at
`http://localhost/portfolio-review/api`.

---

## 3. How It Works

- **Roles:** `submitter` (default on register), `reviewer`, `admin` (create
  manually in the DB — see commented-out seed in `sql/schema.sql`).
- **Submit a portfolio:** any logged-in user → `POST /api/portfolios`.
- **Review a portfolio:** only `reviewer`/`admin` accounts, and not on your
  own submission → `POST /api/portfolios/:id/reviews` with structured scores
  (creativity, technical, presentation, overall — each 1–10) + a comment.
- **Aggregate scores:** cached on the `portfolios` row and recomputed
  automatically (`Portfolio::refreshAggregates`) every time a review is
  added, edited, or deleted.
- **Historical feedback:** `GET /api/portfolios/:id/reviews` returns every
  review for that portfolio in chronological order — this is your full
  feedback history/timeline.
- **Resubmission:** `PUT /api/portfolios/:id` with `resubmit: true` bumps the
  `version` field and resets status to `pending`, while all past reviews stay
  attached to the portfolio for history.

### Optional AI reviews
- Any logged-in user can request an AI review of any portfolio (including
  their own — the self-review restriction only applies to human reviewers):
  `POST /api/portfolios/:id/ai-review`.
- It calls an OpenAI-compatible Chat Completions endpoint (configurable in
  `api/config/ai.php` via the `AI_REVIEW_API_KEY`, `AI_REVIEW_API_URL`, and
  `AI_REVIEW_MODEL` environment variables) and asks for the same four scores
  a human gives, plus written feedback.
- **Set the API key before using this feature** — without it, the endpoint
  returns a clear 502 error explaining it isn't configured yet; nothing else
  in the app is affected.
- AI reviews are stored in the exact same `reviews` table as human reviews
  (no separate system, no separate history) — just tagged
  `author_type = 'ai'` with `ai_model` recording which model produced it.
  `reviewer_id` is `NULL` for AI reviews since there's no human account
  behind them.
- The feedback history endpoint and UI show both types side by side, each
  clearly labeled "Human" or "AI · <model name>".
- **Existing installs:** run `sql/migration_ai_reviews.sql` once to add the
  new columns. Fresh installs get them automatically from `sql/schema.sql`.

## 4. API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | – | Create account |
| POST | /api/auth/login | – | Get JWT |
| GET | /api/auth/me | ✔ | Current user |
| GET | /api/portfolios | – | Browse/filter (query: category, status, tag, page, perPage) |
| GET | /api/portfolios/:id | – | Portfolio detail |
| POST | /api/portfolios | ✔ | Submit portfolio |
| PUT | /api/portfolios/:id | ✔ owner/admin | Edit / resubmit |
| DELETE | /api/portfolios/:id | ✔ owner/admin | Delete |
| GET | /api/my/portfolios | ✔ | My submissions |
| GET | /api/users/:id/portfolios | – | A user's public submissions |
| GET | /api/portfolios/:id/reviews | – | Full feedback history |
| POST | /api/portfolios/:id/reviews | ✔ reviewer/admin | Submit review |
| POST | /api/portfolios/:id/ai-review | ✔ any user | Generate optional AI review |
| GET | /api/reviews/:id | – | Single review |
| PUT | /api/reviews/:id | ✔ reviewer/admin (own) | Edit review |
| DELETE | /api/reviews/:id | ✔ owner of review/admin | Delete review |
| GET | /api/my/reviews | ✔ | Reviews I've given |

All responses are JSON: `{ success, message, data }` on success or
`{ success: false, message, errors }` on failure.

## 5. Folder Structure

```
portfolio-review/
  api/
    config/       database.php, cors.php, ai.php
    core/         Router.php, Request.php, Response.php, Auth.php (JWT)
    models/       User.php, Portfolio.php, Review.php
    controllers/  AuthController.php, PortfolioController.php, ReviewController.php
    services/     AIReviewService.php
    middleware/   AuthMiddleware.php, RoleMiddleware.php
    .htaccess
    index.php
  client/
    src/
      api/        api.js
      context/     AuthContext.jsx
      components/  PortfolioCard.jsx, ScoreDisplay.jsx, ReviewForm.jsx
      pages/       Dashboard, Login, Register, SubmitPortfolio, MyPortfolios, PortfolioDetail
      App.jsx, main.jsx, styles.css
  sql/
    schema.sql
    migration_ai_reviews.sql
```
