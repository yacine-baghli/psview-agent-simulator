# Changelog

All notable changes to AuraRecruit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] — 2026-06-20

### Added
- **Candidate Profile Modal**: Relocated simulated candidate configuration from the Left Panel into a dedicated glassmorphic modal dialog, accessible from three entry points in the Interactive Sandbox.
- **Close button** on the LLM API configuration dropdown panel.
- **Light Mode**: Soft slate-zinc theme (less blinding, premium contrast) with a toggle in the header.
- Custom **scrollbar styling** — dark purple/indigo thumb in dark mode, subtle grey in light mode.

### Fixed
- Corrected absolute positioning of the API configuration dropdown (it no longer pushes the page layout when opened).
- Resolved JSON unterminated string parsing errors from LLM outputs by strengthening prompt escaping guidelines and using lowercase OpenAPI schema types.
- Fixed active reasoning step card text contrast in light mode.
- Fixed select dropdown option readability on Windows in both light and dark modes.

### Changed
- Multi-provider LLM support: **Google Gemini**, **OpenAI GPT-4o**, **Anthropic Claude** — configurable from the UI.
- Prompt schema types standardized to lowercase (`object`, `string`, `array`, `boolean`) for full JSON Schema compliance.
- README updated with new Candidate Customization walkthrough and resized screenshots.

---

## [1.0.0] — 2026-06-19

### Added
- Initial release: **AuraRecruit** autonomous recruiter agent simulator.
- Company context form with presets (PSVIEW, Linear, Mistral AI).
- Recruiter persona synthesis engine (name, title, personality, pitch angle, guardrails).
- 3-step outreach sequence planner.
- Interactive candidate chat sandbox.
- Live reasoning stream visualizer — 5-step cognitive loop (Analysis → Strategy → Draft → Review → Delivery).
- Multi-step agent self-correction loop when guardrails fail.
- Quick-reply chips for rapid candidate simulation.
- Gemini 1.5 Flash API integration with structured JSON output.
- Deployed on Vercel.
