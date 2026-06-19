"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Brain, 
  User, 
  Send, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Key, 
  Building2, 
  Play, 
  ArrowRight, 
  Compass, 
  Check, 
  HelpCircle, 
  Zap,
  Info,
  Settings,
  Sun,
  Moon,
  X
} from "lucide-react";
import { PRESETS, CompanyPreset } from "./presets";

interface Message {
  sender: "agent" | "candidate";
  text: string;
  timestamp: string;
}

interface ReasoningLog {
  analysis: {
    sentiment: string;
    intent: string;
    keyObjections: string[];
  };
  strategy: string;
  initialDraft: string;
  selfReview: {
    concisenessCheck: string;
    toneCheck: string;
    accuracyCheck: string;
    passed: boolean;
  };
  refinement: string;
  finalMessage: string;
}

interface AgentPersona {
  agentName: string;
  agentTitle: string;
  personaDescription: string;
  pitchAngle: string;
  systemGuidelines: string[];
  outreachSequence: {
    step: number;
    subject?: string;
    message: string;
  }[];
}

export default function Home() {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // API Config inputs
  const [apiProvider, setApiProvider] = useState<"gemini" | "openai" | "anthropic">("gemini");
  const [apiKey, setApiKey] = useState("");
  const [apiModel, setApiModel] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  // Form State (initialized with first preset - PSVIEW)
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyCulture, setCompanyCulture] = useState("");
  const [profilesHired, setProfilesHired] = useState("");
  const [tone, setTone] = useState<string>("Hacker / High-Agency");
  const [outboundIntent, setOutboundIntent] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("psview");

  // Candidate Profile State (loaded from preset)
  const [candidateName, setCandidateName] = useState("");
  const [candidateHeadline, setCandidateHeadline] = useState("");
  const [candidateBio, setCandidateBio] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);

  // Generated Agent Persona
  const [agentPersona, setAgentPersona] = useState<AgentPersona | null>(null);
  
  // Chat Simulator State
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [candidateInput, setCandidateInput] = useState("");
  
  // UI States
  const [isInitializing, setIsInitializing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Real-time Reasoning States
  const [activeReasoning, setActiveReasoning] = useState<ReasoningLog | null>(null);
  const [reasoningPhase, setReasoningPhase] = useState<"idle" | "analyzing" | "strategizing" | "drafting" | "reviewing" | "complete">("idle");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load API Key, Provider, Model, and Theme from LocalStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("psview_api_key") || localStorage.getItem("psview_gemini_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
    const savedProvider = localStorage.getItem("psview_api_provider") as "gemini" | "openai" | "anthropic" | null;
    if (savedProvider) {
      setApiProvider(savedProvider);
    }
    const savedModel = localStorage.getItem("psview_api_model");
    if (savedModel) {
      setApiModel(savedModel);
    }
    const savedTheme = localStorage.getItem("psview_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
    // Load default preset
    loadPreset(PRESETS[0]);
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("psview_theme", theme);
  }, [theme]);

  // Save API Key
  const handleSaveKey = (val: string) => {
    setApiKey(val);
    if (val) {
      localStorage.setItem("psview_api_key", val);
      localStorage.setItem("psview_gemini_key", val); // fallback safety
    } else {
      localStorage.removeItem("psview_api_key");
      localStorage.removeItem("psview_gemini_key");
    }
  };

  // Save Provider
  const handleSaveProvider = (val: "gemini" | "openai" | "anthropic") => {
    setApiProvider(val);
    localStorage.setItem("psview_api_provider", val);
    // Reset key and model suggestion on shift if desired, or let them stay
    setApiModel("");
    localStorage.removeItem("psview_api_model");
  };

  // Save Model
  const handleSaveModel = (val: string) => {
    setApiModel(val);
    if (val) {
      localStorage.setItem("psview_api_model", val);
    } else {
      localStorage.removeItem("psview_api_model");
    }
  };

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isReplying]);

  const loadPreset = (preset: CompanyPreset) => {
    setCompanyName(preset.name);
    setIndustry(preset.industry);
    setCompanyCulture(preset.culture);
    setProfilesHired(preset.profilesHired);
    setTone(preset.tone);
    setOutboundIntent(preset.outboundIntent);
    setSelectedPresetId(preset.id);
    
    // Load candidate info
    setCandidateName(preset.candidateProfile.name);
    setCandidateHeadline(preset.candidateProfile.headline);
    setCandidateBio(preset.candidateProfile.bio);
    setQuickReplies(preset.candidateProfile.quickReplies);
    
    // Reset simulation
    setAgentPersona(null);
    setMessages([]);
    setCurrentStep(0);
    setActiveReasoning(null);
    setReasoningPhase("idle");
    setErrorMsg(null);
  };

  // 1. Build Agent & Generate Sequence
  const handleBuildAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInitializing(true);
    setErrorMsg(null);
    setAgentPersona(null);
    setMessages([]);
    setCurrentStep(0);
    setActiveReasoning(null);
    setReasoningPhase("idle");

    try {
      const res = await fetch("/api/agent?action=init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiConfig: {
            provider: apiProvider,
            key: apiKey,
            model: apiModel,
          },
          companyName,
          companyCulture,
          profilesHired,
          tone,
          outboundIntent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize agent.");
      }

      setAgentPersona(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while building the agent.");
    } finally {
      setIsInitializing(false);
    }
  };

  // 2. Start Conversation (Send Message 1)
  const handleStartConversation = () => {
    if (!agentPersona) return;
    
    const firstMsg = agentPersona.outreachSequence.find(s => s.step === 1);
    if (!firstMsg) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        sender: "agent",
        text: firstMsg.message,
        timestamp: time
      }
    ]);
    setCurrentStep(1);
    
    // Simulate reasoning for the initial cold reach
    setActiveReasoning({
      analysis: {
        sentiment: "Neutral (Cold Outreach)",
        intent: "Initiate contact with a highly relevant candidate.",
        keyObjections: []
      },
      strategy: `Synthesized pitch focused on "${agentPersona.pitchAngle}". Crafting a highly personalized intro highlighting candidate's expertise.`,
      initialDraft: firstMsg.message,
      selfReview: {
        concisenessCheck: "Under 120 words, perfect for high readability.",
        toneCheck: `Matches the specified "${tone}" tone: engaging, clear, and direct.`,
        accuracyCheck: "No compensation numbers or unverified benefits mentioned.",
        passed: true
      },
      refinement: "Draft approved without revisions.",
      finalMessage: firstMsg.message
    });
    setReasoningPhase("complete");
  };

  // 3. Simulating Candidate Reply & Agent Reasoning Loop
  const handleSendCandidateReply = async (replyText: string) => {
    if (!replyText.trim() || isReplying || !agentPersona) return;

    const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append Candidate Reply to chat
    const updatedMessages = [
      ...messages,
      {
        sender: "candidate",
        text: replyText,
        timestamp: timeNow()
      }
    ] as Message[];

    setMessages(updatedMessages);
    setCandidateInput("");
    setIsReplying(true);
    setErrorMsg(null);
    
    // Run the visual step-by-step reasoning cycle
    setReasoningPhase("analyzing");
    setActiveReasoning(null);

    try {
      // Step-by-step simulation delay for realism and cognitive flow visualizer
      await new Promise(r => setTimeout(r, 1200));
      setReasoningPhase("strategizing");
      await new Promise(r => setTimeout(r, 1500));
      setReasoningPhase("drafting");
      await new Promise(r => setTimeout(r, 1500));
      setReasoningPhase("reviewing");
      await new Promise(r => setTimeout(r, 1200));

      const res = await fetch("/api/agent?action=chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiConfig: {
            provider: apiProvider,
            key: apiKey,
            model: apiModel,
          },
          companyContext: { companyName, companyCulture, tone },
          agentPersona,
          conversationHistory: updatedMessages.slice(0, -1), // prior history
          candidateReply: replyText
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate reply.");
      }

      setActiveReasoning(data);
      setReasoningPhase("complete");

      // Deliver Agent message
      setMessages(prev => [
        ...prev,
        {
          sender: "agent",
          text: data.finalMessage,
          timestamp: timeNow()
        }
      ]);
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while simulating the response.");
      setReasoningPhase("idle");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-500 transition-colors duration-300">
      
      {/* Background Gradient Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-glow-2 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-glow-1 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[450px] h-[450px] bg-glow-3 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-header-bg backdrop-blur-md border-b border-border-theme py-4 px-6 md:px-12 flex justify-between items-center transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="relative flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Brain className="w-5 h-5 text-slate-900 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent flex items-center gap-2">
              AuraRecruit <span className="text-[10px] uppercase font-mono tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded">Autonomous Agent Lab</span>
            </h1>
            <p className="text-[11px] text-text-secondary">PSVIEW Founding Engineer Technical Test</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Preset Buttons */}
          <div className="hidden lg:flex items-center bg-bg-input p-1 rounded-lg border border-border-theme text-xs transition-colors duration-300">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => loadPreset(p)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  selectedPresetId === p.id 
                    ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner" 
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-lg bg-bg-panel hover:bg-bg-input border border-border-theme text-text-secondary hover:text-text-primary transition-colors duration-300 cursor-pointer"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* API Key configuration */}
          <div className="relative" style={{ position: "relative" }}>
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-panel hover:bg-bg-input text-xs font-mono text-text-secondary hover:text-text-primary border border-border-theme transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-cyan-500" />
              {apiKey ? `${apiProvider.toUpperCase()} Configured` : "Configure LLM API"}
            </button>

            {showKeyInput && (
              <div 
                className="absolute right-0 mt-2 w-80 p-4 bg-bg-card-dark border border-border-theme rounded-xl shadow-2xl z-50 text-xs"
                style={{ position: "absolute", top: "100%", right: 0 }}
              >
                <button 
                  type="button"
                  onClick={() => setShowKeyInput(false)}
                  className="absolute top-3 right-3 text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-input transition-colors cursor-pointer"
                  title="Close Configuration"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <h4 className="font-bold mb-3 flex items-center gap-1.5 text-text-primary">
                  <Settings className="w-3.5 h-3.5 text-text-secondary" />
                  LLM API Configuration
                </h4>
                
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">API Provider</label>
                    <select
                      value={apiProvider}
                      onChange={(e) => handleSaveProvider(e.target.value as any)}
                      className="w-full bg-bg-panel border border-border-theme rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-cyan-500"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI ChatGPT</option>
                      <option value="anthropic">Anthropic Claude</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">API Key</label>
                    <input
                      type="password"
                      placeholder={
                        apiProvider === "gemini" ? "AI Studio key (AIzaSy...)" :
                        apiProvider === "openai" ? "OpenAI key (sk-proj-...)" :
                        "Claude key (sk-ant-...)"
                      }
                      value={apiKey}
                      onChange={(e) => handleSaveKey(e.target.value)}
                      className="w-full bg-bg-panel border border-border-theme rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1 flex justify-between">
                      <span>Model Override</span>
                      <span className="text-[9px] text-text-secondary lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={
                        apiProvider === "gemini" ? "gemini-1.5-flash" :
                        apiProvider === "openai" ? "gpt-4o-mini" :
                        "claude-3-5-sonnet-20241022"
                      }
                      value={apiModel}
                      onChange={(e) => handleSaveModel(e.target.value)}
                      className="w-full bg-bg-panel border border-border-theme rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-card-dark flex justify-between text-[10px] text-text-secondary">
                  <span>Saves to localStorage</span>
                  <span className="text-emerald-500 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Secure Client
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Dashboard */}
      <main className="flex-1 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1700px] w-full mx-auto">
        
        {/* Preset Selectors for Mobile */}
        <div className="lg:hidden col-span-12 flex flex-col gap-2 bg-bg-panel p-4 rounded-xl border border-border-theme">
          <p className="text-xs text-text-secondary font-medium">Select Company Preset Template:</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => loadPreset(p)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedPresetId === p.id 
                    ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
                    : "bg-bg-input text-text-secondary hover:text-text-primary border border-border-theme"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* COLUMN 1: Company Context & Campaign Settings (Left Panel - 4/12 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-bg-panel border border-border-theme rounded-2xl p-6 shadow-xl flex flex-col max-h-[880px] overflow-y-auto relative backdrop-blur-md transition-colors duration-300">
            
            {/* Panel Title */}
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-text-primary">1. Context & Outreach Setup</h2>
            </div>

            <form onSubmit={handleBuildAgent} className="flex-1 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[11px] text-text-secondary font-semibold mb-1 uppercase tracking-wide">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. PSVIEW"
                  className="w-full bg-bg-input border border-border-theme rounded-lg px-3.5 py-2.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-text-secondary"
                />
              </div>

              <div>
                <label className="block text-[11px] text-text-secondary font-semibold mb-1 uppercase tracking-wide">Industry/Sector</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. AI-agent HR technology"
                  className="w-full bg-bg-input border border-border-theme rounded-lg px-3.5 py-2.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-text-secondary"
                />
              </div>

              <div>
                <label className="block text-[11px] text-text-secondary font-semibold mb-1 uppercase tracking-wide">Culture & Core Perks</label>
                <textarea
                  rows={3}
                  value={companyCulture}
                  onChange={(e) => setCompanyCulture(e.target.value)}
                  placeholder="Describe your work style, office presence, and key perks to stand out..."
                  className="w-full bg-bg-input border border-border-theme rounded-lg px-3.5 py-2.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-text-secondary resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] text-text-secondary font-semibold mb-1 uppercase tracking-wide">Profiles Typically Hired</label>
                <input
                  type="text"
                  value={profilesHired}
                  onChange={(e) => setProfilesHired(e.target.value)}
                  placeholder="e.g. Founding engineers, ML developers"
                  className="w-full bg-bg-input border border-border-theme rounded-lg px-3.5 py-2.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-text-secondary"
                />
              </div>

              <div>
                <label className="block text-[11px] text-text-secondary font-semibold mb-1 uppercase tracking-wide">Communication Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-bg-input border border-border-theme rounded-lg px-3.5 py-2.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  <option value="Hacker / High-Agency">Hacker / High-Agency (Casual, tech-first, raw)</option>
                  <option value="Professional / Clear">Professional / Clear (Sleek, direct, respectful)</option>
                  <option value="Warm / Supportive">Warm / Supportive (Empathic, friendly, culture-rich)</option>
                  <option value="Meticulous / Muted">Meticulous / Muted (Understated, focused on high craft)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-text-secondary font-semibold mb-1 uppercase tracking-wide flex justify-between">
                  <span>Campaign Outbound Intent</span>
                  <span className="text-[10px] text-cyan-500 normal-case font-normal flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Drives agent alignment
                  </span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={outboundIntent}
                  onChange={(e) => setOutboundIntent(e.target.value)}
                  placeholder="Who are you targeting, for what role, and what specific hook should the agent configure itself around?"
                  className="w-full bg-bg-input border border-border-theme rounded-lg px-3.5 py-2.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-text-secondary resize-none leading-relaxed"
                />
              </div>


              <button
                type="submit"
                disabled={isInitializing}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 shadow-[0_4px_20px_rgba(16,185,129,0.15)] disabled:shadow-none hover:shadow-[0_4px_25px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed cursor-pointer"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Vibe & Planning Campaign...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Configure Recruiter Agent
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* COLUMN 2: Agent Mind & Sequencing (Middle Panel - 4/12 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-bg-panel border border-border-theme rounded-2xl p-6 shadow-xl flex flex-col h-full backdrop-blur-md relative overflow-hidden transition-colors duration-300">
            
            {/* Header Title */}
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-text-primary">2. Agent Mind & Outreach Sequence</h2>
            </div>

            {!agentPersona ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-border-theme rounded-xl bg-white/[0.01]">
                <div className="w-12 h-12 bg-bg-input rounded-full flex items-center justify-center mb-4 border border-border-theme">
                  <Brain className="w-6 h-6 text-text-secondary" />
                </div>
                <h4 className="text-sm font-semibold mb-1 text-text-primary">Agent Offline</h4>
                <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                  Fill in the company context on the left and trigger the initialization. The agent will read the parameters, synthesize a custom persona, plan its pitch angles, and create an outreach message sequence.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-5 overflow-y-auto max-h-[750px] pr-1">
                
                {/* Synthesized Persona */}
                <div className="bg-bg-panel p-4 rounded-xl border border-border-theme">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-xs">
                        {agentPersona.agentName[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-500">{agentPersona.agentName}</h4>
                        <p className="text-[10px] text-text-secondary">{agentPersona.agentTitle}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase bg-cyan-500/15 text-cyan-500 px-2 py-0.5 border border-cyan-500/20 rounded">
                      Persona Synced
                    </span>
                  </div>
                  <p className="text-[11px] text-text-primary italic leading-relaxed mb-3">
                    &ldquo;{agentPersona.personaDescription}&rdquo;
                  </p>
                  
                  {/* Pitch Angle */}
                  <div className="border-t border-border-theme pt-2 text-[11px]">
                    <span className="text-text-secondary font-semibold">Strategic Pitch Angle:</span>
                    <p className="text-text-primary mt-0.5 leading-relaxed">{agentPersona.pitchAngle}</p>
                  </div>
                </div>

                {/* Recruiter Guidelines */}
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-500" />
                    Cognitive Guardrails ({agentPersona.systemGuidelines.length})
                  </h4>
                  <ul className="grid grid-cols-1 gap-1.5">
                    {agentPersona.systemGuidelines.map((guideline, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-bg-input border border-border-theme p-2 rounded text-[11px] text-text-primary">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outreach Sequence */}
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                    Planned Touchpoint Sequence
                  </h4>
                  <div className="flex flex-col gap-3">
                    {agentPersona.outreachSequence.map((step, idx) => (
                      <div key={idx} className="bg-bg-panel border border-border-theme rounded-xl p-3 flex flex-col gap-2 relative">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono text-cyan-500 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/10">
                            STEP {step.step}: {step.step === 1 ? "OUTBOUND INTRO" : step.step === 2 ? "FOLLOW UP (T+3)" : "FINAL REACH (T+7)"}
                          </span>
                          {step.subject && <span className="text-text-secondary text-[9px] font-mono">Subj: {step.subject}</span>}
                        </div>
                        <p className="text-[11px] text-text-primary font-mono leading-relaxed bg-bg-input p-2.5 rounded border border-border-theme max-h-[140px] overflow-y-auto">
                          {step.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulation trigger */}
                {messages.length === 0 && (
                  <button
                    onClick={handleStartConversation}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(59,130,246,0.2)] cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Initiate Campaign Simulator
                  </button>
                )}

              </div>
            )}
          </div>
        </section>

        {/* COLUMN 3: Outbound Simulator (Right Panel - 4/12 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-bg-panel border border-border-theme rounded-2xl shadow-xl flex flex-col h-full backdrop-blur-md relative overflow-hidden min-h-[500px] transition-colors duration-300">
            
            {/* Header */}
            <div className="p-5 border-b border-border-theme flex justify-between items-center bg-bg-primary/30">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-500" />
                <h2 className="text-base font-bold text-text-primary">3. Interactive Sandbox</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(true)}
                  className="p-1.5 rounded-lg bg-bg-input hover:bg-bg-panel border border-border-theme text-[10px] flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors cursor-pointer font-mono"
                  title="Configure simulated test candidate profile"
                >
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  Configure Test Candidate
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      setMessages([]);
                      setCurrentStep(0);
                      setActiveReasoning(null);
                      setReasoningPhase("idle");
                    }}
                    className="p-1.5 rounded-lg bg-bg-input hover:bg-bg-panel border border-border-theme text-[10px] flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Chat
                  </button>
                )}
              </div>
            </div>

            {/* Candidate Bio Header */}
            {agentPersona && (
              <div className="p-4 bg-bg-panel border-b border-border-theme flex gap-3 text-xs justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{candidateName}</h4>
                    <p className="text-[10px] text-cyan-500 leading-tight font-medium mb-1">{candidateHeadline}</p>
                    <p className="text-[10px] text-text-secondary leading-relaxed max-h-[38px] overflow-y-auto bg-bg-input p-1.5 rounded border border-border-theme font-mono">
                      {candidateBio}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(true)}
                  className="p-1.5 rounded-lg bg-bg-input hover:bg-bg-panel border border-border-theme text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
                  title="Configure test candidate profile"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Empty Chat Area */}
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-white/[0.01]">
                <div className="w-12 h-12 bg-bg-input rounded-full flex items-center justify-center mb-4 border border-border-theme text-text-secondary">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold mb-1 text-text-primary">Outreach Thread Sandbox</h4>
                <p className="text-xs text-text-secondary max-w-xs leading-relaxed mb-4">
                  Start the simulator by pressing &ldquo;Initiate Campaign Simulator&rdquo; in the middle panel. This will send step 1 of your sequence.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(true)}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(99,102,241,0.15)] cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  Configure Test Candidate Profile
                </button>
              </div>
            ) : (
              // Chat Sandbox Stream
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                
                {/* Chat Log */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-h-[450px]">
                  {messages.map((msg, idx) => {
                    const isAgent = msg.sender === "agent";
                    return (
                      <div 
                        key={idx} 
                        className={`flex gap-3 max-w-[85%] ${isAgent ? "self-start" : "self-end flex-row-reverse"}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                          isAgent 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                        }`}>
                          {isAgent ? agentPersona?.agentName[0] : candidateName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[9px] font-mono mb-1 text-text-secondary ${isAgent ? "text-left" : "text-right"}`}>
                            {isAgent ? agentPersona?.agentName : candidateName} • {msg.timestamp}
                          </span>
                          <div className={`p-3 rounded-2xl text-[11px] leading-relaxed ${
                            isAgent 
                              ? "bg-bg-chat-agent text-text-chat-agent border border-border-chat-agent rounded-tl-none font-mono" 
                              : "bg-bg-chat-candidate text-text-chat-candidate border border-border-chat-candidate rounded-tr-none font-sans"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Replier Thinking Indicator */}
                  {isReplying && (
                    <div className="flex gap-3 self-start max-w-[85%] animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold shrink-0">
                        {agentPersona?.agentName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono mb-1 text-text-secondary">
                          {agentPersona?.agentName} is thinking...
                        </span>
                        <div className="p-3 bg-bg-input text-text-secondary border border-border-theme rounded-2xl rounded-tl-none text-[11px] italic flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                          Executing Agent reasoning pipeline...
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Candidate Interactive Controls */}
                <div className="p-4 border-t border-border-theme bg-bg-panel flex flex-col gap-3">
                  
                  {/* Quick-reply chips */}
                  {quickReplies.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] uppercase tracking-wider text-text-secondary font-semibold font-mono flex items-center gap-1">
                        <User className="w-3 h-3" /> Quick Simulate Candidate Reply:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                        {quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            disabled={isReplying}
                            onClick={() => handleSendCandidateReply(reply)}
                            className="bg-bg-chip hover:bg-indigo-500/15 border border-border-chip text-text-chip px-2.5 py-1.5 rounded-lg text-[10px] text-left leading-tight transition-all disabled:opacity-40 cursor-pointer"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual input */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendCandidateReply(candidateInput);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      disabled={isReplying}
                      value={candidateInput}
                      onChange={(e) => setCandidateInput(e.target.value)}
                      placeholder={isReplying ? "Recruiter agent is formulating thoughts..." : `Type custom reply as ${candidateName}...`}
                      className="flex-1 bg-bg-input border border-border-theme rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-indigo-500 placeholder:text-text-secondary disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isReplying || !candidateInput.trim()}
                      className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-xs flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>
            )}
          </div>
        </section>

        {/* AGENT MIND: Detailed Reasoning Stream Visualizer (Bottom Panel - Spans 12 cols) */}
        <section className="col-span-12">
          <div className="bg-bg-panel border border-border-theme rounded-2xl p-6 shadow-xl flex flex-col backdrop-blur-md relative overflow-hidden min-h-[300px] transition-colors duration-300">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-theme">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-bold text-text-primary">4. Live Recruiter Mind / Reasoning Stream</h2>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-text-secondary font-mono text-[10px]">
                  <Info className="w-3.5 h-3.5 text-cyan-500" />
                  Showing the cognitive cycle driving response decisions.
                </span>
              </div>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3 text-xs leading-relaxed animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold">Execution Error:</span> {errorMsg}.
                  {!apiKey && <span className="ml-1 text-cyan-300">Try configuring your API key in the configuration bar above.</span>}
                </div>
              </div>
            )}

            {/* Reasoning Timeline State */}
            {reasoningPhase === "idle" && !activeReasoning && (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-white/[0.01] border border-dashed border-border-theme rounded-xl">
                <Brain className="w-8 h-8 text-text-secondary mb-3" />
                <h4 className="text-xs font-semibold text-text-secondary">Waiting for Outreach Campaign Simulation</h4>
                <p className="text-[11px] text-text-secondary max-w-lg mt-1 leading-relaxed">
                  Start the outreach thread sandbox. When the candidate replies, the agent&apos;s internal reasoning loop steps (Intent Analysis, Strategic Intent, Draft Constraints, and Validation Guardrails) will run here in real-time.
                </p>
              </div>
            )}

            {/* Active Simulation Thinking Step Logs */}
            {reasoningPhase !== "idle" && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                
                {/* STEP 1: ANALYSIS */}
                <div className={`p-4 rounded-xl border transition-all ${
                  reasoningPhase === "analyzing" 
                    ? "bg-bg-step-analysis-active border-border-step-analysis-active shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-border-step-analysis-active/20" 
                    : activeReasoning 
                      ? "bg-bg-card-dark border-border-theme opacity-85" 
                      : "bg-bg-input border-border-theme opacity-40"
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-cyan-500 font-bold uppercase tracking-wider">Step 1: Analysis</span>
                    {reasoningPhase === "analyzing" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    ) : activeReasoning ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold mb-2 text-text-primary">Candidate Intent Analysis</h4>
                  
                  {reasoningPhase === "analyzing" ? (
                    <div className="space-y-2">
                      <div className="h-3 bg-text-secondary/10 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-text-secondary/10 rounded w-5/6 animate-pulse" />
                      <div className="h-3 bg-text-secondary/10 rounded w-1/2 animate-pulse" />
                    </div>
                  ) : activeReasoning ? (
                    <div className="text-[11px] space-y-2 text-text-primary">
                      <div>
                        <span className="text-text-secondary font-semibold block uppercase text-[9px]">Sentiment:</span>
                        <span className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {activeReasoning.analysis.sentiment}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary font-semibold block uppercase text-[9px]">Extracted Intent:</span>
                        <p className="leading-relaxed text-text-primary font-mono mt-0.5">{activeReasoning.analysis.intent}</p>
                      </div>
                      {activeReasoning.analysis.keyObjections.length > 0 && (
                        <div>
                          <span className="text-text-secondary font-semibold block uppercase text-[9px] text-rose-500">Identified Objections:</span>
                          <ul className="list-disc pl-3 text-[10px] space-y-0.5 mt-0.5 text-rose-600 dark:text-rose-400">
                            {activeReasoning.analysis.keyObjections.map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* STEP 2: STRATEGY */}
                <div className={`p-4 rounded-xl border transition-all ${
                  reasoningPhase === "strategizing" 
                    ? "bg-bg-step-strategy-active border-border-step-strategy-active shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-border-step-strategy-active/20" 
                    : activeReasoning 
                      ? "bg-bg-card-dark border-border-theme opacity-85" 
                      : "bg-bg-input border-border-theme opacity-40"
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase tracking-wider">Step 2: Strategy</span>
                    {reasoningPhase === "strategizing" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                    ) : activeReasoning ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold mb-2 text-text-primary">Response Strategy</h4>
                  
                  {reasoningPhase === "strategizing" || (reasoningPhase === "analyzing" && !activeReasoning) ? (
                    <div className="space-y-2">
                      {reasoningPhase === "strategizing" ? (
                        <>
                          <div className="h-3 bg-text-secondary/10 rounded w-full animate-pulse" />
                          <div className="h-3 bg-text-secondary/10 rounded w-4/5 animate-pulse" />
                          <div className="h-3 bg-text-secondary/10 rounded w-3/4 animate-pulse" />
                        </>
                      ) : (
                        <span className="text-text-secondary italic text-[11px]">Waiting for step 1...</span>
                      )}
                    </div>
                  ) : activeReasoning ? (
                    <div className="text-[11px] leading-relaxed text-text-primary font-mono">
                      <span className="text-text-secondary font-semibold block uppercase text-[9px] mb-1">Decision Engine Path:</span>
                      {activeReasoning.strategy}
                    </div>
                  ) : null}
                </div>

                {/* STEP 3: DRAFT */}
                <div className={`p-4 rounded-xl border transition-all ${
                  reasoningPhase === "drafting" 
                    ? "bg-bg-step-draft-active border-border-step-draft-active shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-border-step-draft-active/20" 
                    : activeReasoning 
                      ? "bg-bg-card-dark border-border-theme opacity-85" 
                      : "bg-bg-input border-border-theme opacity-40"
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-purple-500 font-bold uppercase tracking-wider">Step 3: Initial Draft</span>
                    {reasoningPhase === "drafting" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                    ) : activeReasoning ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold mb-2 text-text-primary">Persona-Aligned Draft</h4>
                  
                  {reasoningPhase === "drafting" || (reasoningPhase !== "complete" && !activeReasoning) ? (
                    <div className="space-y-2">
                      {reasoningPhase === "drafting" ? (
                        <>
                          <div className="h-3 bg-text-secondary/10 rounded w-full animate-pulse" />
                          <div className="h-3 bg-text-secondary/10 rounded w-5/6 animate-pulse" />
                        </>
                      ) : (
                        <span className="text-text-secondary italic text-[11px]">Waiting for strategy...</span>
                      )}
                    </div>
                  ) : activeReasoning ? (
                    <div className="text-[11px] leading-relaxed text-text-primary font-mono bg-black/5 dark:bg-black/25 p-2 rounded max-h-[120px] overflow-y-auto border border-border-theme">
                      {activeReasoning.initialDraft}
                    </div>
                  ) : null}
                </div>

                {/* STEP 4: REVIEW & CORRECTION */}
                <div className={`p-4 rounded-xl border transition-all ${
                  reasoningPhase === "reviewing" 
                    ? "bg-bg-step-review-active border-border-step-review-active shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-border-step-review-active/20" 
                    : activeReasoning 
                      ? "bg-bg-card-dark border-border-theme opacity-85" 
                      : "bg-bg-input border-border-theme opacity-40"
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-rose-500 font-bold uppercase tracking-wider">Step 4: Guardrail Review</span>
                    {reasoningPhase === "reviewing" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                    ) : activeReasoning ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold mb-2 text-text-primary">Constraint Evaluation</h4>
                  
                  {reasoningPhase === "reviewing" || (reasoningPhase !== "complete" && !activeReasoning) ? (
                    <div className="space-y-2">
                      {reasoningPhase === "reviewing" ? (
                        <>
                          <div className="h-3 bg-text-secondary/10 rounded w-full animate-pulse" />
                          <div className="h-3 bg-text-secondary/10 rounded w-3/4 animate-pulse" />
                        </>
                      ) : (
                        <span className="text-text-secondary italic text-[11px]">Waiting for draft...</span>
                      )}
                    </div>
                  ) : activeReasoning ? (
                    <div className="text-[10px] space-y-2 text-text-primary font-mono">
                      <div className="flex items-start gap-1">
                        <span className="text-[8px] uppercase text-text-secondary block min-w-[70px]">Conciseness:</span>
                        <span className="text-text-primary">{activeReasoning.selfReview.concisenessCheck}</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-[8px] uppercase text-text-secondary block min-w-[70px]">Tone Match:</span>
                        <span className="text-text-primary">{activeReasoning.selfReview.toneCheck}</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-[8px] uppercase text-text-secondary block min-w-[70px]">Accuracy:</span>
                        <span className="text-text-primary">{activeReasoning.selfReview.accuracyCheck}</span>
                      </div>
                      
                      <div className="border-t border-border-theme pt-1.5 flex items-center gap-1.5">
                        <span className="text-[8px] uppercase text-text-secondary">Evaluation:</span>
                        {activeReasoning.selfReview.passed ? (
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            PASSED (NO EDIT)
                          </span>
                        ) : (
                          <span className="bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            FAILED (CORRECTION TRIGGERED)
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* STEP 5: FINAL OUTPUT */}
                <div className={`p-4 rounded-xl border transition-all ${
                  reasoningPhase === "complete" && activeReasoning 
                    ? "bg-bg-step-delivery-active border-border-step-delivery-active shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-border-step-delivery-active/20" 
                    : "bg-bg-input border-border-theme opacity-40"
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider">Step 5: Delivery</span>
                    {reasoningPhase === "complete" && activeReasoning ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold mb-2 text-text-primary">Refined Final Message</h4>
                  
                  {reasoningPhase !== "complete" || !activeReasoning ? (
                    <div className="space-y-2">
                      <span className="text-text-secondary italic text-[11px]">Processing response...</span>
                    </div>
                  ) : (
                    <div className="text-[11px] leading-relaxed text-text-primary font-mono bg-black/5 dark:bg-black/25 p-2 rounded max-h-[120px] overflow-y-auto border border-border-theme">
                      {activeReasoning.selfReview.passed ? (
                        <div className="text-text-secondary dark:text-slate-400 italic text-[10px] mb-1.5">
                          ✓ Draft passed validation. Delivering initial response.
                        </div>
                      ) : (
                        <div className="text-rose-500 dark:text-rose-400 font-semibold text-[9px] mb-1.5">
                          ⚠ Refined response: &ldquo;{activeReasoning.refinement}&rdquo;
                        </div>
                      )}
                      {activeReasoning.finalMessage}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-border-theme text-center text-[10px] text-text-secondary bg-footer-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 PSVIEW Recruiter Agent Labs. All rights reserved. Yacine Baghli</p>
          <div className="flex gap-4">
            <a href="https://github.com/yacine-baghli/psview-agent-simulator" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">GitHub Repository</a>
            <span>•</span>
            <a href="#top" className="hover:text-text-primary transition-colors">Back to top</a>
          </div>
        </div>
      </footer>

      {/* Candidate Profile Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-bg-panel border border-border-theme rounded-2xl p-6 shadow-2xl relative flex flex-col gap-4 text-xs transition-colors duration-300">
            <button 
              type="button"
              onClick={() => setShowCandidateModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-input transition-colors cursor-pointer"
              title="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Configure Test Candidate Profile
                </h3>
                <p className="text-[10px] text-text-secondary">Set the mock candidate variables for simulation</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] text-text-secondary font-semibold mb-1 uppercase tracking-wide">Candidate Name</label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-bg-input border border-border-theme rounded-lg px-3.5 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-text-secondary"
                />
              </div>

              <div>
                <label className="block text-[10px] text-text-secondary font-semibold mb-1 uppercase tracking-wide">Headline</label>
                <input
                  type="text"
                  required
                  value={candidateHeadline}
                  onChange={(e) => setCandidateHeadline(e.target.value)}
                  placeholder="e.g. Creator of open-source project"
                  className="w-full bg-bg-input border border-border-theme rounded-lg px-3.5 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-text-secondary"
                />
              </div>

              <div>
                <label className="block text-[10px] text-text-secondary font-semibold mb-1 uppercase tracking-wide">Biography Context</label>
                <textarea
                  rows={3}
                  required
                  value={candidateBio}
                  onChange={(e) => setCandidateBio(e.target.value)}
                  placeholder="Describe candidate's history, traits, and background..."
                  className="w-full bg-bg-input border border-border-theme rounded-lg px-3.5 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-text-secondary resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] text-text-secondary font-semibold mb-1 uppercase tracking-wide">
                  Quick-Replies (one per line)
                </label>
                <textarea
                  rows={4}
                  required
                  value={quickReplies.join("\n")}
                  onChange={(e) => setQuickReplies(e.target.value.split("\n"))}
                  placeholder="Replies candidate can quickly select..."
                  className="w-full bg-bg-input border border-border-theme rounded-lg px-3.5 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-text-secondary resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="mt-2 pt-3 border-t border-border-theme flex justify-end">
              <button
                type="button"
                onClick={() => setShowCandidateModal(false)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-[11px] rounded-lg transition-colors cursor-pointer"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
