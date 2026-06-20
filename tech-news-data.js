// tech-news-data.js
// Auto-updated 2026-06-20 — do not edit manually

var TECH_NEWS = {
  date: "2026-06-20",
  main: {
    title: "Microsoft Discovers New Lightweight Backdoor That Steals Cryptocurrency",
    category: "Cybersecurity",
    content: [
      "Microsoft has uncovered a new and sophisticated piece of malware, dubbed 'Crypto Clipper,' that specifically targets cryptocurrency users by silently intercepting and redirecting digital transactions. The malware operates as a lightweight backdoor, making it harder for traditional security tools to detect compared to heavier, more resource-intensive threats. Its discovery highlights the continuing evolution of financially motivated cybercrime, with attackers focusing their efforts on the largely unregulated and often irreversible world of digital currency.",
      "One of the most notable characteristics of Crypto Clipper is its ability to spread via USB drives, a propagation method reminiscent of older malware families but still remarkably effective in environments where removable media is commonplace. By piggybacking on physical storage devices, the malware can jump across air-gapped or otherwise network-isolated systems that might otherwise be considered secure. This self-propagating capability significantly broadens the potential attack surface and complicates containment efforts once an infection takes hold.",
      "To evade detection and maintain persistent communication with its operators, Crypto Clipper routes its network traffic through Tor, the anonymizing network more commonly associated with privacy advocates and, unfortunately, cybercriminals alike. Using Tor as a command-and-control channel makes it exceedingly difficult for network defenders and law enforcement to trace communications back to the malware\'s authors or hosting infrastructure. This technical sophistication suggests the threat actors behind the campaign are experienced and well-resourced.",
      "The core mechanism of a 'clipboard hijacker' or crypto clipper is deceptively simple yet devastatingly effective: when a victim copies a cryptocurrency wallet address to their clipboard — a routine step when sending digital funds — the malware silently replaces the address with one controlled by the attacker. Because cryptocurrency wallet addresses are long, complex alphanumeric strings that users rarely verify character by character, the substitution often goes unnoticed until the funds are irrecoverably gone. The attack requires no additional interaction from the victim beyond the normal act of making a transaction.",
      "Microsoft\'s discovery and public disclosure of Crypto Clipper serves as an important reminder that cybersecurity vigilance remains critical in the age of digital assets. Users handling cryptocurrency are strongly advised to double-check wallet addresses carefully before confirming any transaction, and to keep their systems patched and protected with up-to-date security software. The finding also underscores the need for organizations to implement strict USB device policies and to monitor outbound Tor traffic as part of a comprehensive defense-in-depth strategy."
    ],
    image: "https://cdn.arstechnica.net/wp-content/uploads/2026/02/cryptocurrency-theft-heist-1152x648.jpg",
    source: "Ars Technica",
    sourceUrl: "https://arstechnica.com/security/2026/06/microsoft-spots-new-self-propagating-malware-for-stealing-cryptocurrency/"
  },
  secondary: [
    {
      id: "tc1",
      title: "NASA Selects Eric Schmidt\'s Relativity Space for 2028 Mars Mission",
      summary: "Relativity Space, led by former Google executive Eric Schmidt, has been chosen by NASA to launch the Aeolus payload to Mars in 2028 under a new public-private partnership.",
      body: [
        "Under the newly announced partnership, Relativity Space will be responsible for providing the spacecraft, rocket, and cruise operations required to deliver NASA\'s Aeolus payload to Mars, marking a significant milestone for the relatively young launch company. The Aeolus payload is expected to deliver the first-of-its-kind scientific data from the Martian environment, adding meaningful scientific value to what is already a landmark commercial spaceflight contract.",
        "The selection of Relativity Space reflects NASA\'s growing reliance on commercial partners to reduce costs and accelerate mission timelines, a strategy that has already borne fruit with companies like SpaceX. For Relativity Space and Eric Schmidt, the contract represents a high-profile validation of the company\'s technology roadmap and its ambitions to compete in the deep-space launch market."
      ],
      image: "https://images.unsplash.com/photo-1586999082731-574a06ec7e25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjYwODl8MHwxfHNlYXJjaHwxfHxOQVNBJTIwU2VsZWN0cyUyMEVyaWMlMjBTY2htaWR0JTVDfGVufDB8MHx8fDE3ODE5MzE4NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      source: "The Verge",
      url: "https://www.theverge.com/science/952988/nasa-relativity-space-eric-schmidt-mars",
      category: "Space"
    },
    {
      id: "tc2",
      title: "A Bold Satellite Rescue Mission Came Together in Record Time — But Will It Work?",
      summary: "An ambitious and rapidly assembled satellite rescue mission is underway, with engineers and mission planners pushing the boundaries of what can be achieved on an accelerated timeline.",
      body: [
        "The mission was pulled together in an extraordinarily compressed timeframe, a feat that those involved describe as a success in itself regardless of the final outcome. As one official put it, 'I consider this a success already, just from the fact that we\'re even going to try this,' reflecting the immense logistical and engineering challenges that had to be overcome just to get to launch.",
        "Satellite rescue missions are rare and technically demanding, requiring precise orbital maneuvering and a deep understanding of both the ailing spacecraft and the rescue vehicle\'s capabilities. The outcome of this attempt could have significant implications for how the industry approaches satellite longevity, insurance, and the feasibility of on-orbit servicing going forward."
      ],
      image: "https://cdn.arstechnica.net/wp-content/uploads/2026/06/Testing-Link-Vibration-tests-2_4000x2600-1152x648.jpg",
      source: "Ars Technica",
      url: "https://arstechnica.com/space/2026/06/a-bold-satellite-rescue-mission-came-together-in-record-time-but-will-it-work/",
      category: "Space"
    },
    {
      id: "tc3",
      title: "Nothing Cancels This Year\'s CMF Phone Due to Surging RAM Prices",
      summary: "Nothing has scrapped plans for a follow-up to the CMF Phone 2 Pro this year, citing prohibitively high memory prices that make it impossible to deliver the device at a competitive budget price point.",
      body: [
        "Nothing co-founder Akis Evangelidis announced the cancellation in a post on X, explaining that with memory prices at their current levels, the company simply cannot build a successor that would meet the budget-friendly expectations of the CMF line. The decision makes Nothing\'s next affordable handset the latest casualty of what has been described as 'RAMageddon,' a market-wide surge in DRAM prices that has rattled smartphone manufacturers across the industry.",
        "The situation illustrates the razor-thin margins that define the budget smartphone segment, where even modest increases in component costs can make an entire product line economically unviable. For consumers eagerly awaiting a new CMF device, the news means a longer wait, while the broader industry watches closely to see when memory prices will stabilize enough to allow affordable handsets to return to the market."
      ],
      image: "https://images.unsplash.com/photo-1672664003242-1c4dc78635d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjYwODl8MHwxfHNlYXJjaHwxfHxOb3RoaW5nJTIwQ2FuY2VscyUyMFRoaXMlMjBZZWFyJTVDfGVufDB8MHx8fDE3ODE5MzE4Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      source: "The Verge",
      url: "https://www.theverge.com/gadgets/953066/nothing-cmf-phone-delayed-ram-prices",
      category: "Hardware"
    }
  ]
};
