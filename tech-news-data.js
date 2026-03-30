// tech-news-data.js
// Updated daily by the automation script
// Loaded via <script src="tech-news-data.js"></script> in tech-news.html

var TECH_NEWS = {
  date: "2026-03-29",
  main: {
    title: "OpenAI Unveils GPT-5 with Real-Time Reasoning and Extended Context Window",
    category: "AI",
    content: [
      "OpenAI on Thursday released GPT-5, its most capable language model to date, introducing what the company describes as 'deliberative reasoning' — a mode in which the model pauses to plan multi-step responses before generating output, resulting in significantly fewer factual errors on complex tasks.",
      "The model ships with a 500,000-token context window, roughly ten times the capacity of its predecessor, enabling developers to pass entire codebases, lengthy legal documents, or hours of meeting transcripts into a single prompt. Early benchmarks from independent evaluators place GPT-5 ahead of Google's Gemini Ultra 2 and Anthropic's Claude 4 Opus on mathematical reasoning and software engineering tasks.",
      "Chief executive Sam Altman described GPT-5 as 'the last model we'll release that feels like a clear step up — from here, progress becomes harder to measure in discrete jumps'. The statement was widely interpreted as a signal that the industry is approaching a plateau in the conventional scaling paradigm, even as compute budgets continue to grow.",
      "Enterprise pricing for GPT-5 starts at $0.015 per thousand input tokens, a 40 per cent reduction compared to GPT-4o at launch. The company simultaneously announced a new tier called ChatGPT Enterprise Pro, aimed at organisations requiring on-premises or private-cloud deployment with audit logging and role-based access controls.",
      "The release has reignited debate among AI safety researchers. Several prominent academics noted that the improved reasoning capability introduces new risks around autonomous task completion — particularly in agentic settings where the model can browse the web, execute code, and send emails on a user's behalf. OpenAI published a 68-page system card alongside the release, disclosing red-team findings and the mitigations applied."
    ],
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop",
    source: "The Verge",
    sourceUrl: "https://www.theverge.com"
  },
  secondary: [
    {
      id: "t1",
      title: "Apple Confirms 'Liquid Glass' UI Overhaul Coming to iOS 20 This Autumn",
      summary: "Apple's biggest visual redesign since iOS 7 will introduce translucent, depth-layered interfaces across the operating system, with the Home Screen, Control Centre, and Messages app all receiving major updates.",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop",
      source: "9to5Mac",
      url: "https://9to5mac.com",
      category: "Gadgets"
    },
    {
      id: "t2",
      title: "EU Regulators Open Formal Probe into Microsoft's GitHub Copilot Training Data",
      summary: "The European Commission has launched an investigation into whether GitHub Copilot's training on public repositories constitutes an unlawful use of copyrighted code, in what could be the bloc's most significant AI enforcement action to date.",
      image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&auto=format&fit=crop",
      source: "Reuters",
      url: "https://www.reuters.com/technology",
      category: "Big Tech"
    },
    {
      id: "t3",
      title: "Y Combinator's Winter 2026 Batch Sets Record with 412 Startups",
      summary: "The latest YC cohort includes a record number of AI infrastructure companies, with roughly 60 per cent of startups focused on agentic workflows, developer tooling, or enterprise AI deployment.",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop",
      source: "TechCrunch",
      url: "https://techcrunch.com",
      category: "Startups"
    }
  ]
};
