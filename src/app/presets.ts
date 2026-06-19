export interface CompanyPreset {
  id: string;
  name: string;
  industry: string;
  culture: string;
  profilesHired: string;
  tone: "Hacker / High-Agency" | "Professional / Clear" | "Warm / Supportive" | "Meticulous / Muted";
  outboundIntent: string;
  candidateProfile: {
    name: string;
    headline: string;
    bio: string;
    quickReplies: string[];
  };
}

export const PRESETS: CompanyPreset[] = [
  {
    id: "psview",
    name: "PSVIEW",
    industry: "AI Agentic Recruiting / HR Tech",
    culture: "SF/Paris hybrid, high agency, ship full-stack apps fast, work extremely hard, no-fluff startup environment.",
    profilesHired: "Founding Engineer Interns, AI Pipeline Engineers, Senior Full-stack React/Rails devs",
    tone: "Hacker / High-Agency",
    outboundIntent: "Reach out to a top-tier student engineer who built an autonomous agent framework on Github. Pitch them the 6-month SF internship starting July 2026, highlighting the $4-5K/mo package, housing in SF, and working at Founders Inc.",
    candidateProfile: {
      name: "Alex Rivera",
      headline: "CS Student @ Stanford | Creator of 'AgentFlow' (1.2k stars)",
      bio: "Alex is a high-achieving CS junior who built a popular open-source agent orchestration tool. Passionate about LLMs, rails, and latency optimization. Lives in California, currently has an offer from a mid-size tech company but wants more ownership.",
      quickReplies: [
        "Hey! This sounds super interesting. I built AgentFlow exactly because current tools are too slow. What's the stack?",
        "Thanks for reaching out! SF housing is nice, but I'm looking for a full-time role after graduation. Do you hire full-time?",
        "I'm actually based in Paris for a study abroad semester starting July. Can I work from the Paris office?",
        "Hey, sounds cool but I'm pretty busy. What's the interview process like?"
      ]
    }
  },
  {
    id: "linear",
    name: "Linear",
    industry: "Productivity Software / Issue Tracking",
    culture: "Meticulous design, remote-first, high craft, no-meeting culture, extreme attention to detail, async-first.",
    profilesHired: "Senior Product Designers, Systems Engineers (Rust/TypeScript)",
    tone: "Meticulous / Muted",
    outboundIntent: "Engage a world-class senior product designer who has published exceptional UI design case studies on Figma and Twitter. Pitch them the craftsmanship-driven design team at Linear, where designers have engineering autonomy.",
    candidateProfile: {
      name: "Clara Vance",
      headline: "Staff UI/UX Designer | Ex-Vercel | Design Systems Lead",
      bio: "Clara is a designer who codes. She is obsessed with micro-interactions, dark mode, keyboard navigation, and pixel perfection. She values deep focus work and hates corporate bureaucracy.",
      quickReplies: [
        "Hi, I love Linear's aesthetic. What design toolchain do you use? Are designers expected to write production React code?",
        "Thanks. I'm happy at my current role, but I've always admired your product. Are you open to part-time contract work?",
        "Interesting. I prefer working in teams with active daily standups and brainstorms. How do you maintain collaboration async?",
        "What is the team's philosophy on product metrics vs pure intuition?"
      ]
    }
  },
  {
    id: "mistral",
    name: "Mistral AI",
    industry: "Artificial Intelligence / Foundation Models",
    culture: "Paris-based, research-heavy, fast-paced model training, flat structure, top-tier scientific excellence, independent European AI champion.",
    profilesHired: "ML Research Engineers, CUDA Optimization Engineers, Infrastructure Engineers",
    tone: "Professional / Clear",
    outboundIntent: "Engage a brilliant GPU infrastructure engineer who recently optimized LLM inference kernels on consumer hardware. Pitch them the opportunity to work directly on training next-gen open-weights models in Paris with massive compute access.",
    candidateProfile: {
      name: "Dr. Hugo Durand",
      headline: "GPU Kernel Specialist | Ex-NVIDIA | PhD in High-Performance Computing",
      bio: "Hugo is a low-level optimization wizard. He writes custom CUDA kernels and has worked on distributed model training pipelines. He wants access to thousands of H100s/H200s and wants to stay in Europe.",
      quickReplies: [
        "Bonjour. What is the size of the compute cluster I would have access to? I need at least 512 GPUs for my experiments.",
        "Merci pour le message. Is the role based in Paris? I am not open to relocating outside of France.",
        "I'm interested in knowing how you balance scientific research publications vs proprietary models.",
        "How is the team structured? Who would I be reporting to?"
      ]
    }
  }
];
