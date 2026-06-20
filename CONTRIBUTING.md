# Contributing to AuraRecruit

Thank you for your interest in contributing! Here's how to get started.

## Getting Started

1. **Fork** the repository and clone it locally.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your API key:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Development Guidelines

- **TypeScript**: All new code must be fully typed. No `any` unless absolutely necessary.
- **Component Style**: Stick to the existing Tailwind CSS + CSS variable design system. Do not introduce new design patterns without discussion.
- **API Routes**: Keep LLM provider logic isolated inside `src/app/api/agent/route.ts`.
- **Commits**: Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `style:`).

## Submitting a Pull Request

1. Create a branch from `main`: `git checkout -b feat/your-feature`.
2. Make your changes and verify the build passes: `npm run build`.
3. Open a PR with a clear description of what you changed and why.
4. Reference any related issues.

## Reporting Issues

Use the [GitHub Issues](../../issues) tab. Please include:
- A clear description of the bug or feature request.
- Steps to reproduce (for bugs).
- Expected vs. actual behavior.
- Screenshots if relevant.

---

All contributions are subject to the [MIT License](LICENSE).
