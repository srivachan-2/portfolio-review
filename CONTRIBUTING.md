# Contributing to AI Portfolio Review Writer

Thank you for your interest in contributing to **AI Portfolio Review Writer**! 🎉

We welcome contributions of all kinds: bug reports, feature suggestions, UI polish, prompt improvements, and documentation enhancements.

---

## Architecture Principles

1. **Frontend-Only & Zero-Backend**: The application must remain 100% client-side, communicating directly with AI provider APIs from the user's browser.
2. **Local-First Privacy**: No user data, portfolio content, or API keys should ever be transmitted to or stored on external servers or central databases.
3. **No External Scraping Proxies**: Do not add server-side scraping proxies that could be abused or violate CORS/browser boundaries.
4. **Clean Code & Modular Components**: Keep components focused, reusable, and free of unnecessary bloat.

---

## Local Development Workflow

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ai-portfolio-review-writer.git
   cd ai-portfolio-review-writer/client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Build and test for production**:
   ```bash
   npm run build
   npm run preview
   ```

---

## Submitting Pull Requests

1. Fork the repo and create your branch from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. Make your modifications cleanly.
3. Verify that `npm run build` succeeds with zero errors.
4. Commit your changes with clear, descriptive messages.
5. Push to your branch and open a Pull Request.

---

## Security & Secrets

- **NEVER** commit API keys, secrets, or private credentials to the repository.
- Always use `.env.example` with placeholder strings.
