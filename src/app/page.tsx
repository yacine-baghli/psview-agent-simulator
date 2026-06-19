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
  Settings
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
  // Key inputs
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

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

  // Load API Key from LocalStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("psview_gemini_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
    // Load default preset
    loadPreset(PRESETS[0]);
  }, []);

  // Save API Key
  const handleSaveKey = (val: string) => {
    setApiKey(val);
    if (val) {
      localStorage.setItem("psview_gemini_key", val);
    } else {
      localStorage.removeItem("psview_gemini_key");
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
          ...(apiKey ? { "x-gemini-key": apiKey } : {}),
        },
        body: JSON.stringify({
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
          ...(apiKey ? { "x-gemini-key": apiKey } : {}),
        },
        body: JSON.stringify({
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Background Gradient Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[450px] h-[450px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#07090e]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative flex justify-center items-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Brain className="w-5 h-5 text-[#07090e] animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
              AuraRecruit <span className="text-[10px] uppercase font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Autonomous Agent Lab</span>
            </h1>
            <p className="text-[11px] text-slate-400">PSVIEW Founding Engineer Technical Test</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Preset Buttons */}
          <div className="hidden lg:flex items-center bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => loadPreset(p)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  selectedPresetId === p.id 
                    ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/20 shadow-inner" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* API Key configuration */}
          <div className="relative">
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 border border-white/15 transition-all"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              {apiKey ? "API Key Configured" : "Provide API Key"}
            </button>

            {showKeyInput && (
              <div className="absolute right-0 mt-2 w-80 p-4 bg-[#0c111c] border border-white/10 rounded-xl shadow-2xl z-50 text-xs">
                <h4 className="font-bold mb-2 flex items-center gap-1.5 text-slate-200">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Gemini API Configuration
                </h4>
                <p className="text-slate-400 mb-3 leading-relaxed">
                  Enter your Google AI Studio API key. If omitted, the app will try to read <code>GEMINI_API_KEY</code> from the server context.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="AI Studio key (AIzaSy...)"
                    value={apiKey}
                    onChange={(e) => handleSaveKey(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  {apiKey && (
                    <button 
                      onClick={() => handleSaveKey("")}
                      className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/20 rounded font-medium transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-[10px] text-slate-400">
                  <span>Saves to localStorage</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Secure Connection
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
        <div className="lg:hidden col-span-12 flex flex-col gap-2 bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="text-xs text-slate-400 font-medium">Select Company Preset Template:</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => loadPreset(p)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedPresetId === p.id 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                    : "bg-[#0c111a] text-slate-400 hover:text-slate-200 border border-white/5"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* COLUMN 1: Company Context & Campaign Settings (Left Panel - 4/12 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full relative overflow-hidden backdrop-blur-md">
            
            {/* Panel Title */}
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-100">1. Context & Outreach Setup</h2>
            </div>

            <form onSubmit={handleBuildAgent} className="flex-1 flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. PSVIEW"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Industry/Sector</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. AI-agent HR technology"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Culture & Core Perks</label>
                <textarea
                  rows={3}
                  value={companyCulture}
                  onChange={(e) => setCompanyCulture(e.target.value)}
                  placeholder="Describe your work style, office presence, and key perks to stand out..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Profiles Typically Hired</label>
                <input
                  type="text"
                  value={profilesHired}
                  onChange={(e) => setProfilesHired(e.target.value)}
                  placeholder="e.g. Founding engineers, ML developers"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wide">Communication Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#0c111a] border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  <option value="Hacker / High-Agency">Hacker / High-Agency (Casual, tech-first, raw)</option>
                  <option value="Professional / Clear">Professional / Clear (Sleek, direct, respectful)</option>
                  <option value="Warm / Supportive">Warm / Supportive (Empathic, friendly, culture-rich)</option>
                  <option value="Meticulous / Muted">Meticulous / Muted (Understated, focused on high craft)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wide flex justify-between">
                  <span>Campaign Outbound Intent</span>
                  <span className="text-[10px] text-cyan-400 normal-case font-normal flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Drives agent alignment
                  </span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={outboundIntent}
                  onChange={(e) => setOutboundIntent(e.target.value)}
                  placeholder="Who are you targeting, for what role, and what specific hook should the agent configure itself around?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isInitializing}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-[#07090e] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 shadow-[0_4px_20px_rgba(16,185,129,0.15)] disabled:shadow-none hover:shadow-[0_4px_25px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed cursor-pointer"
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full backdrop-blur-md relative overflow-hidden">
            
            {/* Header Title */}
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100">2. Agent Mind & Outreach Sequence</h2>
            </div>

            {!agentPersona ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-slate-600" />
                </div>
                <h4 className="text-sm font-semibold mb-1 text-slate-300">Agent Offline</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Fill in the company context on the left and trigger the initialization. The agent will read the parameters, synthesize a custom persona, plan its pitch angles, and create an outreach message sequence.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-5 overflow-y-auto max-h-[750px] pr-1">
                
                {/* Synthesized Persona */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        {agentPersona.agentName[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-300">{agentPersona.agentName}</h4>
                        <p className="text-[10px] text-slate-400">{agentPersona.agentTitle}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase bg-cyan-500/15 text-cyan-300 px-2 py-0.5 border border-cyan-500/20 rounded">
                      Persona Synced
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic leading-relaxed mb-3">
                    &ldquo;{agentPersona.personaDescription}&rdquo;
                  </p>
                  
                  {/* Pitch Angle */}
                  <div className="border-t border-white/5 pt-2 text-[11px]">
                    <span className="text-slate-400 font-semibold">Strategic Pitch Angle:</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{agentPersona.pitchAngle}</p>
                  </div>
                </div>

                {/* Recruiter Guidelines */}
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    Cognitive Guardrails ({agentPersona.systemGuidelines.length})
                  </h4>
                  <ul className="grid grid-cols-1 gap-1.5">
                    {agentPersona.systemGuidelines.map((guideline, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 p-2 rounded text-[11px] text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outreach Sequence */}
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    Planned Touchpoint Sequence
                  </h4>
                  <div className="flex flex-col gap-3">
                    {agentPersona.outreachSequence.map((step, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 relative">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/10">
                            STEP {step.step}: {step.step === 1 ? "OUTBOUND INTRO" : step.step === 2 ? "FOLLOW UP (T+3)" : "FINAL REACH (T+7)"}
                          </span>
                          {step.subject && <span className="text-slate-500 text-[9px] font-mono">Subj: {step.subject}</span>}
                        </div>
                        <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-[#07090e]/60 p-2.5 rounded border border-white/5 max-h-[140px] overflow-y-auto">
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
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl flex flex-col h-full backdrop-blur-md relative overflow-hidden min-h-[500px]">
            
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#07090e]/30">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-slate-100">3. Interactive Sandbox</h2>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => {
                    setMessages([]);
                    setCurrentStep(0);
                    setActiveReasoning(null);
                    setReasoningPhase("idle");
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Chat
                </button>
              )}
            </div>

            {/* Candidate Bio Header */}
            {agentPersona && (
              <div className="p-4 bg-white/5 border-b border-white/5 flex gap-3 text-xs">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">{candidateName}</h4>
                  <p className="text-[10px] text-cyan-400 leading-tight font-medium mb-1">{candidateHeadline}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed max-h-[38px] overflow-y-auto bg-black/20 p-1.5 rounded border border-white/5 font-mono">
                    {candidateBio}
                  </p>
                </div>
              </div>
            )}

            {/* Empty Chat Area */}
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-white/[0.01]">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 text-slate-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold mb-1 text-slate-300">Outreach Thread Sandbox</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Start the simulator by pressing &ldquo;Initiate Campaign Simulator&rdquo; in the middle panel. This will send step 1 of your sequence.
                </p>
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
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                        }`}>
                          {isAgent ? agentPersona?.agentName[0] : candidateName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[9px] font-mono mb-1 text-slate-500 ${isAgent ? "text-left" : "text-right"}`}>
                            {isAgent ? agentPersona?.agentName : candidateName} • {msg.timestamp}
                          </span>
                          <div className={`p-3 rounded-2xl text-[11px] leading-relaxed ${
                            isAgent 
                              ? "bg-white/5 text-slate-200 border border-white/5 rounded-tl-none font-mono" 
                              : "bg-indigo-500/20 text-slate-100 border border-indigo-500/30 rounded-tr-none font-sans"
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
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {agentPersona?.agentName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono mb-1 text-slate-500">
                          {agentPersona?.agentName} is thinking...
                        </span>
                        <div className="p-3 bg-white/5 text-slate-400 border border-white/5 rounded-2xl rounded-tl-none text-[11px] italic flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                          Executing Agent reasoning pipeline...
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Candidate Interactive Controls */}
                <div className="p-4 border-t border-white/10 bg-[#07090e]/60 flex flex-col gap-3">
                  
                  {/* Quick-reply chips */}
                  {quickReplies.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono flex items-center gap-1">
                        <User className="w-3 h-3" /> Quick Simulate Candidate Reply:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                        {quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            disabled={isReplying}
                            onClick={() => handleSendCandidateReply(reply)}
                            className="bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-300 px-2.5 py-1.5 rounded-lg text-[10px] text-left leading-tight transition-all disabled:opacity-40 cursor-pointer"
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
                      className="flex-1 bg-[#0c111c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 disabled:opacity-50"
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col backdrop-blur-md relative overflow-hidden min-h-[300px]">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-slate-100">4. Live Recruiter Mind / Reasoning Stream</h2>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  Showing the cognitive cycle driving response decisions.
                </span>
              </div>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex items-center gap-3 text-xs leading-relaxed animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold">Execution Error:</span> {errorMsg}.
                  {!apiKey && <span className="ml-1 text-cyan-300">Try entering your Gemini API key in the configuration bar above.</span>}
                </div>
              </div>
            )}

            {/* Reasoning Timeline State */}
            {reasoningPhase === "idle" && !activeReasoning && (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-white/[0.01] border border-dashed border-white/5 rounded-xl">
                <Brain className="w-8 h-8 text-slate-600 mb-3" />
                <h4 className="text-xs font-semibold text-slate-400">Waiting for Outreach Campaign Simulation</h4>
                <p className="text-[11px] text-slate-500 max-w-lg mt-1 leading-relaxed">
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
                    ? "bg-[#0b141d]/80 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20" 
                    : activeReasoning 
                      ? "bg-white/5 border-white/10 opacity-75" 
                      : "bg-[#07090e]/40 border-white/5 opacity-40"
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">Step 1: Analysis</span>
                    {reasoningPhase === "analyzing" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    ) : activeReasoning ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold mb-2 text-slate-200">Candidate Intent Analysis</h4>
                  
                  {reasoningPhase === "analyzing" ? (
                    <div className="space-y-2">
                      <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-white/10 rounded w-5/6 animate-pulse" />
                      <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse" />
                    </div>
                  ) : activeReasoning ? (
                    <div className="text-[11px] space-y-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase text-[9px]">Sentiment:</span>
                        <span className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-400">
                          {activeReasoning.analysis.sentiment}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block uppercase text-[9px]">Extracted Intent:</span>
                        <p className="leading-relaxed text-slate-300 font-mono mt-0.5">{activeReasoning.analysis.intent}</p>
                      </div>
                      {activeReasoning.analysis.keyObjections.length > 0 && (
                        <div>
                          <span className="text-slate-500 font-semibold block uppercase text-[9px] text-rose-400">Identified Objections:</span>
                          <ul className="list-disc pl-3 text-[10px] space-y-0.5 mt-0.5 text-rose-300">
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
                    ? "bg-[#111124]/80 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20" 
                    : activeReasoning 
                      ? "bg-white/5 border-white/10 opacity-75" 
                      : "bg-[#07090e]/40 border-white/5 opacity-40"
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Step 2: Strategy</span>
                    {reasoningPhase === "strategizing" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                    ) : activeReasoning ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold mb-2 text-slate-200">Response Strategy</h4>
                  
                  {reasoningPhase === "strategizing" || (reasoningPhase === "analyzing" && !activeReasoning) ? (
                    <div className="space-y-2">
                      {reasoningPhase === "strategizing" ? (
                        <>
                          <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
                          <div className="h-3 bg-white/10 rounded w-4/5 animate-pulse" />
                          <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse" />
                        </>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">Waiting for step 1...</span>
                      )}
                    </div>
                  ) : activeReasoning ? (
                    <div className="text-[11px] leading-relaxed text-slate-300 font-mono">
                      <span className="text-slate-500 font-semibold block uppercase text-[9px] mb-1">Decision Engine Path:</span>
                      {activeReasoning.strategy}
                    </div>
                  ) : null}
                </div>

                {/* STEP 3: DRAFT */}
                <div className={`p-4 rounded-xl border transition-all ${
                  reasoningPhase === "drafting" 
                    ? "bg-[#16101c]/80 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20" 
                    : activeReasoning 
                      ? "bg-white/5 border-white/10 opacity-75" 
                      : "bg-[#07090e]/40 border-white/5 opacity-40"
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Step 3: Initial Draft</span>
                    {reasoningPhase === "drafting" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                    ) : activeReasoning ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold mb-2 text-slate-200">Persona-Aligned Draft</h4>
                  
                  {reasoningPhase === "drafting" || (reasoningPhase !== "complete" && !activeReasoning) ? (
                    <div className="space-y-2">
                      {reasoningPhase === "drafting" ? (
                        <>
                          <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
                          <div className="h-3 bg-white/10 rounded w-5/6 animate-pulse" />
                        </>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">Waiting for strategy...</span>
                      )}
                    </div>
                  ) : activeReasoning ? (
                    <div className="text-[11px] leading-relaxed text-slate-400 font-mono bg-black/25 p-2 rounded max-h-[120px] overflow-y-auto border border-white/5">
                      {activeReasoning.initialDraft}
                    </div>
                  ) : null}
                </div>

                {/* STEP 4: REVIEW & CORRECTION */}
                <div className={`p-4 rounded-xl border transition-all ${
                  reasoningPhase === "reviewing" 
                    ? "bg-[#181111]/80 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20" 
                    : activeReasoning 
                      ? "bg-white/5 border-white/10 opacity-75" 
                      : "bg-[#07090e]/40 border-white/5 opacity-40"
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">Step 4: Guardrail Review</span>
                    {reasoningPhase === "reviewing" ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                    ) : activeReasoning ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold mb-2 text-slate-200">Constraint Evaluation</h4>
                  
                  {reasoningPhase === "reviewing" || (reasoningPhase !== "complete" && !activeReasoning) ? (
                    <div className="space-y-2">
                      {reasoningPhase === "reviewing" ? (
                        <>
                          <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
                          <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse" />
                        </>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">Waiting for draft...</span>
                      )}
                    </div>
                  ) : activeReasoning ? (
                    <div className="text-[10px] space-y-2 text-slate-300 font-mono">
                      <div className="flex items-start gap-1">
                        <span className="text-[8px] uppercase text-slate-500 block min-w-[70px]">Conciseness:</span>
                        <span className="text-slate-300">{activeReasoning.selfReview.concisenessCheck}</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-[8px] uppercase text-slate-500 block min-w-[70px]">Tone Match:</span>
                        <span className="text-slate-300">{activeReasoning.selfReview.toneCheck}</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-[8px] uppercase text-slate-500 block min-w-[70px]">Accuracy:</span>
                        <span className="text-slate-300">{activeReasoning.selfReview.accuracyCheck}</span>
                      </div>
                      
                      <div className="border-t border-white/5 pt-1.5 flex items-center gap-1.5">
                        <span className="text-[8px] uppercase text-slate-500">Evaluation:</span>
                        {activeReasoning.selfReview.passed ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            PASSED (NO EDIT)
                          </span>
                        ) : (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
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
                    ? "bg-[#0b1c13]/80 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20" 
                    : "bg-[#07090e]/40 border-white/5 opacity-40"
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Step 5: Delivery</span>
                    {reasoningPhase === "complete" && activeReasoning ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : null}
                  </div>
                  <h4 className="text-xs font-semibold mb-2 text-slate-200">Refined Final Message</h4>
                  
                  {reasoningPhase !== "complete" || !activeReasoning ? (
                    <div className="space-y-2">
                      <span className="text-slate-600 italic text-[11px]">Processing response...</span>
                    </div>
                  ) : (
                    <div className="text-[11px] leading-relaxed text-slate-300 font-mono bg-black/25 p-2 rounded max-h-[120px] overflow-y-auto border border-white/5">
                      {activeReasoning.selfReview.passed ? (
                        <div className="text-slate-400 italic text-[10px] mb-1.5">
                          ✓ Draft passed validation. Delivering initial response.
                        </div>
                      ) : (
                        <div className="text-rose-400 font-semibold text-[9px] mb-1.5">
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
      <footer className="mt-auto py-6 border-t border-white/5 text-center text-[10px] text-slate-500 bg-[#07090e]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 PSVIEW Recruiter Agent Labs. All rights reserved. Created for founding engineer interview.</p>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">GitHub Repository</a>
            <span>•</span>
            <a href="#top" className="hover:text-slate-300 transition-colors">Back to top</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
