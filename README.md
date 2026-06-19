# AuraRecruit — PSVIEW Autonomous Agent Lab

A state-of-the-art interactive web sandbox for simulating and observing **autonomous recruiting agents** that learn company context, synthesize their own recruiter personas, and run candidate engagement campaigns with real-time, transparent self-reflection.

## 🚀 Deployed URL & Code
* **Live App**: [https://psview-agent-test.vercel.app](https://psview-agent-test.vercel.app) *(or your deployed Vercel URL)*
* **Repository**: [https://github.com/username/psview-agent-simulator](https://github.com/username/psview-agent-simulator)

---

## 🧠 What makes this agent intelligent and not just an LLM call?

> **The agent executes an autonomous, multi-step Cognitive Loop (ReAct/Reflect) for every turn:** Instead of wrapping a single prompt to generate text, it performs **Intent & Sentiment Extraction**, isolates key objections, formulates a **Strategic Tactic**, drafts under strict **Persona Constraints**, runs a **Self-Review Guardrail Check** (evaluating conciseness, accuracy, and brand alignment), and **Self-Corrects/Refines** the message before delivery—surfacing this entire reasoning stream transparently to the user.

---

## 🛠️ Technology Stack & Choices

1. **Next.js 14/16 (App Router) & TypeScript**: Enables high-performance serverless endpoints for API requests, making it lightweight, secure, and fast to deploy.
2. **Tailwind CSS & Glassmorphism Theme**: Created a bespoke, immersive dark mode dashboard. Features glow accents, real-time typing indicators, and a responsive layout that looks professional and fits the high-agency branding of PSVIEW.
3. **Google Gemini 1.5 Flash (via fetch API)**: High-speed, high-context execution, supporting structured JSON schema outputs for robust rendering of the agent's internal mind logs.
4. **Lucide React**: Clean, modern icons to categorize reasoning steps and layout controls.

---

## 🎨 Core Features Built

* **Context Configuration Form**: Fields for company context (culture, perks, typical profiles, tone, intent) with **one-click presets** (PSVIEW Founding Intern, Linear Product Designer, Mistral AI Research Engineer) for instant, friction-free testing.
* **Recruiter Persona Synthesizer**: Configures itself automatically from context to generate a custom name, title, bio, system guidelines, and a 3-step outreach campaign sequence.
* **Interactive Sandbox Simulator**: Real-time chat panel displaying the conversation, prefilled with simulated candidate replies (based on their profile) or allowing custom free-text input.
* **Agent Mind Visualizer**: Displays a step-by-step reasoning log (Analysis ➔ Strategy ➔ Initial Draft ➔ Guardrail Review ➔ Refined Delivery) showing exactly *how* the agent thinks.

---

## 💻 Local Setup & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/username/psview-agent-simulator.git
   cd psview-agent-simulator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API Key**:
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_google_ai_studio_api_key
   ```
   *Note: Alternatively, you can paste your API key directly in the UI configuration bar in the browser; it will be saved securely to local storage.*

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the simulator.

5. **Build for production**:
   ```bash
   npm run build
   ```
