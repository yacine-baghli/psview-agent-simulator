# AuraRecruit — PSVIEW Autonomous Agent Lab

A state-of-the-art interactive web sandbox for simulating and observing **autonomous recruiting agents** that learn company context, synthesize their own recruiter personas, and run candidate engagement campaigns with real-time, transparent self-reflection.

## 🚀 Live URL & Code
* **Live App**: [https://psview-agent-simulator.vercel.app](https://psview-agent-simulator.vercel.app)
* **GitHub Repository**: [https://github.com/yacine-baghli/psview-agent-simulator](https://github.com/yacine-baghli/psview-agent-simulator)
* **Author**: Yacine Baghli

---

## 🧠 What makes this agent intelligent and not just an LLM call?

> **The agent executes an autonomous, multi-step Cognitive Loop (ReAct/Reflect) for every turn:** Instead of wrapping a single prompt to generate text, it performs **Intent & Sentiment Extraction**, isolates key objections, formulates a **Strategic Tactic**, drafts under strict **Persona Constraints**, runs a **Self-Review Guardrail Check** (evaluating conciseness, accuracy, and brand alignment), and **Self-Corrects/Refines** the message before delivery—surfacing this entire reasoning stream transparently to the user.

---

## 📖 Step-by-Step Usage Guide

Follow these steps to run a candidate outreach campaign simulation:

### 1. Configure the API Key
* Click on **"Provide API Key"** in the top right header.
* Paste your **Google AI Studio (Gemini) API Key** and press Enter. 
* *Note: The key is saved securely in your browser's local storage and is never sent to any server other than directly to the Gemini API endpoint. If an environment variable `GEMINI_API_KEY` is configured on your server (like on Vercel), you can skip this step.*

### 2. Choose a Preset (or Create Your Own)
* Select one of the pre-configured templates at the top to instantly load realistic parameters:
  * **PSVIEW**: High-agency startup context looking for founding engineering interns.
  * **Linear**: Craftsmanship-driven designer search with an async, remote-first culture.
  * **Mistral AI**: GPU infra optimization recruiting with high-performance model clusters.
* Alternatively, edit the form fields manually to configure your custom company name, industry, tone preference, perks/culture, and outbound campaign intent.

### 3. Build & Configure the Agent
* Click **"Configure Recruiter Agent"** at the bottom of the left panel.
* The agent will automatically analyze the input data and generate:
  * A custom **Recruiter Persona** (Name, Job Title, Vibe bio).
  * A set of **Cognitive Guardrails** (Rules it must respect).
  * A **Planned Touchpoint Sequence** (Messages 1, 2, and 3).

### 4. Run the Sandbox Simulator
* Click **"Initiate Campaign Simulator"** in the middle panel. This will send step 1 of your campaign sequence to the candidate chat sandbox on the right.
* Read the **simulated candidate profile** at the top right (Name, Bio, Headline).
* Simulate a candidate reply by:
  * Clicking one of the **Quick Replies** buttons (tailored to that specific candidate profile).
  * Or typing a custom free-text reply in the input bar and clicking send.

### 5. Inspect the Agent's Mind
* When a reply is sent, look at the **"Live Recruiter Mind / Reasoning Stream"** panel at the bottom.
* Watch the agent step through its cognitive loop:
  1. **Analysis**: Extract sentiment, underlying intent, and isolate candidate objections.
  2. **Strategy**: Reason on how to address the response (e.g. explain perks, SF housing, flights, compute details).
  3. **Draft**: Formulate the response aligned with persona rules.
  4. **Guardrail Review**: Check if the draft is concise, accurate, and matches tone constraints.
  5. **Delivery**: Show if self-correction was triggered and output the final response!

---

## 🛠️ Technology Stack & Choices

* **Next.js 16 (App Router) & TypeScript**: Server-side routing, static optimizations, and robust API endpoints.
* **Tailwind CSS & Theme CSS Variables**: Bespoke layout supporting instant, smooth transitions between **Dark Mode** and **Light Mode** (managed via state and CSS custom properties).
* **Google Gemini 1.5 Flash**: Lightning-fast inference speeds with strict structured JSON output support.
* **Lucide React**: Premium icon pack for clean dashboard classification.

---

## 💻 Local Setup & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yacine-baghli/psview-agent-simulator.git
   cd psview-agent-simulator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment key (optional)**:
   Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_google_ai_studio_api_key
   ```

4. **Run local server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to run the app.
