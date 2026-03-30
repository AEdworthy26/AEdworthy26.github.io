// world-news-data.js
// Updated daily by scripts/generate-news.js
// Loaded via <script src="world-news-data.js"></script> in world-news.html

var WORLD_NEWS = {
  date: "2026-03-29",
  main: {
    title: "UN Climate Summit Reaches Landmark Agreement on Emissions Targets",
    content: [
      "World leaders gathered in Geneva this week reached a historic accord on accelerating emissions reduction targets, with 147 nations pledging to cut carbon output by 45 per cent relative to 2010 levels before the end of the decade.",
      "The agreement, brokered after three days of intensive negotiations, marks the most ambitious multilateral climate commitment since the Paris Accords. Crucially, it includes a binding arbitration mechanism — a first for a UN climate instrument — allowing member states to challenge one another's compliance records before an independent panel.",
      "The United States and China, which together account for roughly 43 per cent of global greenhouse gas emissions, both signed the accord. Beijing's endorsement was described by European negotiators as the single most important development of the summit. China also committed to halting construction of new coal-fired power stations by the end of next year.",
      "Critics from small island nations and environmental groups argued the targets remain insufficient given the current pace of warming. Representatives from Pacific nations staged a silent walkout during the final plenary session to signal their dissatisfaction, insisting that stabilising global temperatures at 1.5°C above pre-industrial levels requires steeper and faster cuts.",
      "Despite these objections, the summit chair, Norwegian Foreign Minister Espen Eide, called the outcome 'a genuine turning point' and acknowledged that further ambition would be required at the next review conference, scheduled for 2028."
    ],
    image: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=1200&auto=format&fit=crop",
    source: "Reuters",
    sourceUrl: "https://www.reuters.com"
  },
  secondary: [
    {
      id: "s1",
      title: "India's Election Commission Announces Dates for Five-State Polls",
      summary: "Voting is to take place across five Indian states in April and May, with the results expected to shape the political landscape ahead of next year's general election.",
      image: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&auto=format&fit=crop",
      source: "BBC World",
      url: "https://www.bbc.com/news/world/asia",
      category: "Politics"
    },
    {
      id: "s2",
      title: "ECB Holds Interest Rates Steady Amid Mixed Eurozone Inflation Data",
      summary: "The European Central Bank kept its benchmark rate unchanged at 3.5 per cent, citing persistent services inflation and uncertainty over global trade conditions following recent US tariff announcements.",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop",
      source: "Financial Times",
      url: "https://www.ft.com",
      category: "Economy"
    },
    {
      id: "s3",
      title: "Ceasefire Holds in West Africa as Talks Enter Second Week",
      summary: "A fragile ceasefire between rival factions in the Sahel region has entered its second week, with AU-brokered negotiations continuing in Dakar. Humanitarian agencies warn that aid access remains severely restricted.",
      image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop",
      source: "Al Jazeera",
      url: "https://www.aljazeera.com",
      category: "Conflict"
    }
  ]
};
