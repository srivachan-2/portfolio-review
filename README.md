# ✨ PortfolioAI WRITER

> **Analyze your developer portfolio, discover what recruiters see in 10 seconds, and turn weak sections into actionable improvements with AI.**

An open-source AI portfolio review and improvement platform built with **React**, **Vite**, and **Google Gemini** on a serverless architecture.

---

## 🌟 Key Features

- **🚀 10-Category Deep Audit**: Granular scoring across Content Quality, Project Quality, Technical Positioning, UX, Recruiter Readiness, Personal Branding, Clarity, Impact, Completeness, and Overall technical signal.
- **✍️ AI Portfolio Writer**: Dedicated side-by-side workspace to rewrite and elevate Hero Taglines, About Narratives, Project Descriptions, Experience Bullets, GitHub READMEs, and LinkedIn Summaries.
- **⚡ Project Improver ("Improve My Project")**: Transforms raw project notes into 5 ready-to-use formats: Recruiter Summaries, Technical Architecture Deep-Dives, 1-Sentence Elevator Pitches, GitHub README snippets, and Metric-Driven Resume Bullets.
- **🎯 AI Recruiter Simulation**: Simulates the initial screening process for 7 target engineering roles (Full Stack, Frontend, Backend, AI/ML, Data Scientist, DevOps), highlighting opportunities for stronger role alignment.
- **🛡️ Server-Side Secret Isolation**: Visitors never need to provide an API key. The Gemini API key remains 100% server-side in serverless environment variables and is never exposed to the client.
- **📁 Local-First Browser History**: Analysis history and accepted drafts are saved in the user's browser (`localStorage`). No external databases and zero tracking.
- **⚡ Built-in Demo Mode**: Instant preview with sample demonstration data without consuming API quota.

---

## 🏗️ Architecture

```text
React 18 + Vite (SPA)
        ↓
Vercel Serverless API (/api/ai)
  • Payload validation
  • Rate limiting (sliding window)
  • GEMINI_API_KEY from process.env
        ↓
Google Gemini API (Server-to-Server)
        ↓
Structured JSON Validator & Sanitizer
        ↓
Browser Frontend & LocalStorage Persistence
```

- **Zero Database / Zero Auth**: No user login required; all history is stored locally in the browser.
- **Serverless API Proxy**: The browser calls the `/api/ai` serverless function. The serverless function attaches the `GEMINI_API_KEY` credential and communicates with Google Gemini over HTTPS.
- **Abuse Protection**: Includes payload size restrictions, operation whitelisting, and in-memory IP sliding-window rate limiting.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: Custom SVG standalone component set
- **Styling**: Modern CSS Design System (Dark Luxe Slate, glassmorphism, responsive grid)
- **AI Engine**: Google Gemini (Configurable via `GEMINI_MODEL`, defaults to `gemini-1.5-flash`)
- **Deployment**: [Vercel](https://vercel.com) (Serverless Functions + Static SPA)

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-username/portfolio-review-2ai.git
cd portfolio-review-2ai/client
npm install
```

### 2. Configure Server Environment Variables
Copy `.env.example` to `.env` in the `client/` folder:
```bash
cp .env.example .env
```

Add your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

> **Security Warning**: `GEMINI_API_KEY` is a server-side secret. Never prefix it with `VITE_` and never commit your real API key to Git.

### 3. Start Local Development Server
```bash
npm run dev
```
The local Vite server includes a development API proxy for `/api/ai` that automatically reads `GEMINI_API_KEY` from your local environment.

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. In **Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = `your_actual_gemini_api_key`
   - `GEMINI_MODEL` = `gemini-1.5-flash` (or your preferred Gemini model)
4. Deploy! Vercel will automatically configure both the static React frontend and the `/api/ai` serverless function.

---

## 🔒 Security & Abuse Protection Considerations

1. **Credential Safety**: The Gemini API key is stored exclusively in server environment variables.
2. **Input Validation**: The `/api/ai` handler validates operation types and enforces payload limits (~35k characters).
3. **Rate Limiting**: Includes a lightweight sliding-window IP rate limiter on the serverless endpoint. *(Note: In distributed serverless environments, each instance maintains local memory state; for high-traffic enterprise deployments, consider pairing with an external Redis store such as Upstash if strict multi-region rate synchronization is required).*

---

## ⚠️ Browser CORS Notice

Web browsers enforce the Same-Origin Policy (CORS). If an external portfolio website blocks direct client-side fetching, PortfolioAI displays a prompt requesting the user to paste their content directly into the text area.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](file:///c:/xampp/htdocs/portfolio-review-2ai/CONTRIBUTING.md) for details on code standards and the PR process.

---

## 📄 License

This project is open-source software licensed under the [MIT License](file:///c:/xampp/htdocs/portfolio-review-2ai/LICENSE).
