# AuraRecruit — PSVIEW Autonomous Agent Lab

A state-of-the-art interactive web sandbox for simulating and observing **autonomous recruiting agents** that learn company context, synthesize their own recruiter personas, and run candidate engagement campaigns with real-time, transparent self-reflection.

<img width="1919" height="1199" alt="image" src="https://github.com/user-attachments/assets/fd04cd57-3814-48d4-b032-b0b803428b59" />

## 🚀 Live URL
* **Live App**: [https://psview-agent-simulator.vercel.app](https://psview-agent-simulator.vercel.app)
* **Author**: Yacine Baghli

---

## 🧠 What makes this agent intelligent and not just an LLM call?

> **The agent executes an autonomous, multi-step Cognitive Loop (ReAct/Reflect) for every turn:** Instead of wrapping a single prompt to generate text, it performs **Intent & Sentiment Extraction**, isolates key objections, formulates a **Strategic Tactic**, drafts under strict **Persona Constraints**, runs a **Self-Review Guardrail Check** (evaluating conciseness, accuracy, and brand alignment), and **Self-Corrects/Refines** the message before delivery—surfacing this entire reasoning stream transparently to the user.

---

## 📖 Step-by-Step Usage Guide

Follow these steps to run a candidate outreach campaign simulation:

### 1. Configure the API Provider & Key
* Click on **"Configure LLM API"** (or provider name) in the top right header.
* Select your preferred LLM Provider:
  * **Google Gemini**: Uses the Google AI Studio backend.
  * **OpenAI ChatGPT**: Uses the standard OpenAI chat completions endpoint.
  * **Anthropic Claude**: Uses the Anthropic Claude messages backend.
* Paste your corresponding **API Key** (e.g. `AIzaSy...`, `sk-proj-...`, or `sk-ant-...`).
* *(Optional)* Override the **Model Name** to use a specific version (e.g. `gpt-4o`, `claude-3-5-sonnet-20241022`, or `gemini-1.5-pro`).
* *Note: Keys are saved securely in your browser's local storage and are never sent to any server other than directly to the corresponding LLM API endpoints. If environment variables (`GEMINI_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`) are configured on your server (like on Vercel), you can skip manual key configuration.*

<img width="287" height="245" alt="image" src="https://github.com/user-attachments/assets/c0eba806-c9c7-4af6-830c-1e1867021ece" />


### 2. Choose a Preset (or Create Your Own)
* Select one of the pre-configured templates at the top to instantly load realistic parameters:
  * **PSVIEW**: High-agency startup context looking for founding engineering interns.
  <img width="509" height="643" alt="image" src="https://github.com/user-attachments/assets/07d4e0f9-8e68-474c-b5a0-dce2a5084df1" />

  * **Linear**: Craftsmanship-driven designer search with an async, remote-first culture.
  <img width="595" height="873" alt="image" src="https://github.com/user-attachments/assets/1311c935-466d-4a4d-9eef-d500f87867c6" />

  * **Mistral AI**: GPU infra optimization recruiting with high-performance model clusters.
  <img width="542" height="846" alt="image" src="https://github.com/user-attachments/assets/03263484-131d-44ab-8d96-8c1fdb423acf" />

* Alternatively, edit the form fields manually to configure your custom company name, industry, tone preference, perks/culture, and outbound campaign intent. 
* **Candidate Customization**: You can customize the simulated test candidate profile at any time. Click the **"Configure Test Candidate"** button in the Interactive Sandbox header, click the **"Configure Test Candidate Profile"** button in the empty chat state, or click the **Settings Gear icon** in the Candidate Bio header once the agent is active. This opens a dedicated configuration modal where you can edit the Candidate's Name, Headline, Biography context, and Sandbox Quick-Replies in real-time.



### 3. Build & Configure the Agent
* Click **"Configure Recruiter Agent"** at the bottom of the left panel.
* The agent will automatically analyze the input data and generate:
  * A custom **Recruiter Persona** (Name, Job Title, Vibe bio).
  * A set of **Cognitive Guardrails** (Rules it must respect).
  * A **Planned Touchpoint Sequence** (Messages 1, 2, and 3).
<img width="513" height="460" alt="image" src="https://github.com/user-attachments/assets/19ec716b-e37e-435c-a30b-c2b455f221de" />
<img width="497" height="642" alt="image" src="https://github.com/user-attachments/assets/c182cb95-0df8-4f84-9ca0-960e26531e9f" />

### 4. Run the Sandbox Simulator
* Click **"Initiate Campaign Simulator"** in the middle panel. This will send step 1 of your campaign sequence to the candidate chat sandbox on the right.
* Read the **simulated candidate profile** at the top right (Name, Bio, Headline).
 <img width="524" height="104" alt="image" src="https://github.com/user-attachments/assets/a6415576-ce40-426d-a6ae-b0ddcbe4f162" />

* Simulate a candidate reply by:
  * Clicking one of the **Quick Replies** buttons (tailored to that specific candidate profile).
  * Or typing a custom free-text reply in the input bar and clicking send.
<img width="540" height="843" alt="image" src="https://github.com/user-attachments/assets/84315ef7-328a-4b8d-91f7-538dc0dfdcdc" />



### 5. Inspect the Agent's Mind
* When a reply is sent, look at the **"Live Recruiter Mind / Reasoning Stream"** panel at the bottom.
* Watch the agent step through its cognitive loop:
  1. **Analysis**: Extract sentiment, underlying intent, and isolate candidate objections.
  2. **Strategy**: Reason on how to address the response (e.g. explain perks, SF housing, flights, compute details).
  3. **Draft**: Formulate the response aligned with persona rules.
  4. **Guardrail Review**: Check if the draft is concise, accurate, and matches tone constraints.
  5. **Delivery**: Show if self-correction was triggered and output the final response!
<img width="1646" height="364" alt="image" src="https://github.com/user-attachments/assets/6683f5f0-846f-43e2-b6d3-5a8eb27b9279" />
<img width="1641" height="406" alt="image" src="https://github.com/user-attachments/assets/a6a3a617-f158-4090-8ee9-4ce4cda14dcd" />

---

## 🌓 Visual Theme Options (Light & Dark Mode)
The application includes a theme switcher in the top header. You can toggle between a sleek, high-tech dark mode and a soft, slate-zinc-based light mode (designed to be easy on the eyes while retaining modern shadows and glassmorphic panel depth).

---

## 🛠️ Technology Stack & Choices

* **Next.js 16 (App Router) & TypeScript**: Server-side routing, static optimizations, and robust API endpoints.
* **Tailwind CSS & Theme CSS Variables**: Bespoke layout supporting instant, smooth transitions between **Dark Mode** and **Light Mode** (managed via state and CSS custom properties).
* **Multi-Provider LLM Integration**: Hand-rolled, lightweight fetch integrations for Google AI Studio, OpenAI, and Anthropic backends.
* **Lucide React**: Premium icon pack for clean dashboard classification.

---

## 💻 Local Setup & Run

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd psview-agent-simulator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment keys (optional)**:
   Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_claude_api_key
   ```

4. **Run local server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to run the app.
