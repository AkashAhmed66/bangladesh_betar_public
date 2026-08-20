export interface DemoNewsStory {
  slug: string;
  title: string;
  summary: string;
  category: string;
  image: string;
  published: string;
  readTime: string;
  body: string[];
}

export interface DemoWatchShow {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  category: "Drama" | "Documentary" | "Culture" | "Kids";
  image: string;
  year: number;
  rating: string;
  episodes: { title: string; duration: string; description: string }[];
}

export const NEWS_STORIES: DemoNewsStory[] = [
  {
    slug: "rail-link-connects-river-regions",
    title: "New rail link brings river communities closer to the capital",
    summary: "The expanded route is expected to shorten journeys, improve regional trade and give more passengers access to reliable public transport.",
    category: "Bangladesh",
    image: "/editorial/news-hero.png",
    published: "12 minutes ago",
    readTime: "4 min read",
    body: [
      "A newly expanded rail connection has begun carrying passengers across one of the country's busiest river corridors, creating a faster link between regional towns and Dhaka.",
      "Transport planners say the service is designed to reduce road pressure while making education, healthcare and markets easier to reach. More services are expected to be added after the first operating review.",
      "Local businesses welcomed the opening and said predictable journey times could make it easier to move fresh produce and small manufactured goods between districts.",
    ],
  },
  {
    slug: "aman-harvest-reaches-local-markets",
    title: "Strong Aman harvest begins reaching local markets",
    summary: "Farmers across several northern districts report healthy yields after a season of careful water management.",
    category: "Economy",
    image: "/editorial/news-rice.png",
    published: "35 minutes ago",
    readTime: "3 min read",
    body: [
      "Freshly harvested Aman rice is arriving at regional markets as growers complete work across the northern districts.",
      "Agriculture officers said local irrigation planning and timely field advice helped many farmers protect their crops through changing weather conditions.",
      "Market observers are monitoring transport and storage costs as the harvest moves from farms to mills and retail centres.",
    ],
  },
  {
    slug: "coastal-volunteers-complete-shelter-drill",
    title: "Coastal volunteers complete early-season shelter drill",
    summary: "Community teams checked first-aid supplies, evacuation routes and communications before the next period of severe weather.",
    category: "Climate",
    image: "/editorial/news-coast.png",
    published: "48 minutes ago",
    readTime: "5 min read",
    body: [
      "Volunteer groups in coastal communities have completed a coordinated readiness exercise focused on cyclone shelter access and household communication.",
      "Teams inspected emergency supplies and practised supporting older residents, children and people with disabilities during an evacuation.",
      "Organisers said the exercise will be repeated in remote areas where travel becomes difficult during heavy rain.",
    ],
  },
  {
    slug: "student-robotics-team-heads-to-regional-final",
    title: "Student robotics team heads to regional innovation final",
    summary: "The university team built a low-cost inspection rover using locally available components and open-source tools.",
    category: "Science",
    image: "/editorial/news-tech.png",
    published: "1 hour ago",
    readTime: "4 min read",
    body: [
      "A student engineering team has qualified for a regional innovation final with a compact rover designed to inspect difficult indoor spaces.",
      "The prototype combines affordable sensors with locally sourced parts, allowing the students to repair and adapt it without specialist equipment.",
      "The team hopes the project will encourage more schools and universities to create practical robotics clubs.",
    ],
  },
  {
    slug: "community-radio-expands-agriculture-bulletins",
    title: "Community radio expands daily agriculture bulletins",
    summary: "New regional segments will share market prices, weather guidance and advice from agricultural extension officers.",
    category: "Media",
    image: "/editorial/news-rice.png",
    published: "2 hours ago",
    readTime: "3 min read",
    body: [
      "Regional radio bulletins are expanding to provide farmers with more frequent weather, crop and market information.",
      "The short programmes will be broadcast at times chosen with local listeners and repeated for people working away from home during the day.",
      "Producers said listeners will also be able to submit questions for future episodes.",
    ],
  },
  {
    slug: "river-research-maps-seasonal-change",
    title: "Researchers map how seasonal rivers are changing",
    summary: "A new public dataset combines satellite observations with reports from people living beside major waterways.",
    category: "Environment",
    image: "/editorial/watch-river.png",
    published: "3 hours ago",
    readTime: "6 min read",
    body: [
      "Researchers have released an open dataset showing how river channels and nearby settlements change across the seasons.",
      "The project combines satellite imagery with observations contributed by schools and community groups.",
      "Planners hope the information can support safer local infrastructure and better decisions about erosion-prone areas.",
    ],
  },
];

export const WATCH_SHOWS: DemoWatchShow[] = [
  {
    slug: "the-last-transmission",
    title: "The Last Transmission",
    eyebrow: "New original drama",
    description: "In a radio studio during the final weeks of 1971, a young broadcaster discovers that one carefully chosen message can travel farther than fear.",
    category: "Drama",
    image: "/editorial/watch-hero.png",
    year: 2026,
    rating: "PG",
    episodes: [
      { title: "The Signal", duration: "46 min", description: "Maya arrives for a night shift that will change the course of the station." },
      { title: "Between Frequencies", duration: "44 min", description: "A hidden message forces the team to decide who they can trust." },
      { title: "The Last Transmission", duration: "52 min", description: "The studio prepares one final broadcast as dawn approaches." },
    ],
  },
  {
    slug: "rivers-that-remember",
    title: "Rivers That Remember",
    eyebrow: "Documentary series",
    description: "Travel with the boat communities whose stories, livelihoods and songs follow the changing waterways of Bangladesh.",
    category: "Documentary",
    image: "/editorial/watch-river.png",
    year: 2026,
    rating: "G",
    episodes: [
      { title: "Morning Tide", duration: "28 min", description: "A fishing family reads the river before sunrise." },
      { title: "Moving Banks", duration: "31 min", description: "Communities adapt as familiar channels shift." },
      { title: "Songs Downstream", duration: "29 min", description: "Music carries memory from one generation to the next." },
    ],
  },
  {
    slug: "songs-of-the-courtyard",
    title: "Songs of the Courtyard",
    eyebrow: "Live performance",
    description: "An intimate evening of folk and classical traditions, recorded with artists from across the country.",
    category: "Culture",
    image: "/editorial/watch-music.png",
    year: 2026,
    rating: "G",
    episodes: [
      { title: "Folk Roads", duration: "42 min", description: "Songs shaped by travel, rivers and village life." },
      { title: "Poetry in Raga", duration: "39 min", description: "Voices and instruments meet in a new arrangement." },
    ],
  },
  {
    slug: "little-field-guides",
    title: "Little Field Guides",
    eyebrow: "New for young explorers",
    description: "Curious children discover the plants, insects and wildlife living just beyond their classroom.",
    category: "Kids",
    image: "/editorial/watch-kids.png",
    year: 2026,
    rating: "G",
    episodes: [
      { title: "Life on a Lily Pad", duration: "14 min", description: "Meet the tiny neighbours of a village pond." },
      { title: "The Busy Banyan", duration: "13 min", description: "A single tree becomes a home for many species." },
      { title: "After the Rain", duration: "15 min", description: "Young explorers follow the clues left by monsoon weather." },
    ],
  },
  {
    slug: "voices-of-betar",
    title: "Voices of Betar",
    eyebrow: "Archive documentary",
    description: "Presenters, engineers and performers revisit the moments that made public radio part of everyday life.",
    category: "Documentary",
    image: "/editorial/watch-hero.png",
    year: 2025,
    rating: "G",
    episodes: [{ title: "Behind the Microphone", duration: "48 min", description: "The people who gave a national service its voice." }],
  },
  {
    slug: "monsoon-kitchen",
    title: "The Monsoon Kitchen",
    eyebrow: "Food and culture",
    description: "Home cooks share seasonal recipes and the family histories that travel with them.",
    category: "Culture",
    image: "/editorial/news-rice.png",
    year: 2026,
    rating: "G",
    episodes: [{ title: "First Rain", duration: "24 min", description: "A menu built around the arrival of the monsoon." }],
  },
  {
    slug: "tomorrows-builders",
    title: "Tomorrow's Builders",
    eyebrow: "Factual series",
    description: "Young inventors turn classroom ideas into practical tools for their communities.",
    category: "Documentary",
    image: "/editorial/news-tech.png",
    year: 2026,
    rating: "G",
    episodes: [{ title: "Small Machines, Big Ideas", duration: "26 min", description: "A robotics club prepares for its first national showcase." }],
  },
  {
    slug: "ready-together",
    title: "Ready Together",
    eyebrow: "Community stories",
    description: "Meet the volunteers strengthening local resilience before severe weather arrives.",
    category: "Documentary",
    image: "/editorial/news-coast.png",
    year: 2026,
    rating: "G",
    episodes: [{ title: "The Shelter Team", duration: "27 min", description: "Neighbours turn preparedness into a shared routine." }],
  },
];

export function newsStory(slug: string): DemoNewsStory | undefined {
  return NEWS_STORIES.find((story) => story.slug === slug);
}

export function watchShow(slug: string): DemoWatchShow | undefined {
  return WATCH_SHOWS.find((show) => show.slug === slug);
}
