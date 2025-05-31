import { NewsItem, Entity, Topic, SentimentData } from '../types';

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'OpenAI Announces GPT-5 with Enhanced Business Intelligence Features',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/openai-gpt5',
    publishedAt: '2025-01-15T08:30:00Z',
    summary: 'OpenAI unveils GPT-5 with significant improvements in context understanding and business data analysis capabilities.',
    content: 'OpenAI today announced the release of GPT-5, the latest version of its groundbreaking AI model. The new model features enhanced capabilities for analyzing business documents, financial reports, and market trends. GPT-5 can now process up to 1 million tokens of context, allowing it to analyze entire quarterly reports and extract key insights automatically. The company claims a 40% improvement in financial analysis accuracy compared to GPT-4.',
    image: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sentiment: 'positive',
    topics: ['AI', 'Technology', 'Business Intelligence'],
    entities: {
      companies: ['OpenAI', 'Microsoft'],
      people: ['Sam Altman', 'Mira Murati'],
      locations: ['San Francisco'],
      metrics: [
        { label: 'Accuracy Improvement', value: '40%' },
        { label: 'Context Window', value: '1 million tokens' }
      ]
    },
    score: 0.95
  },
  {
    id: '2',
    title: 'Tesla Reports Record Q1 Earnings, Exceeds Analyst Expectations',
    source: 'Bloomberg',
    url: 'https://bloomberg.com/tesla-q1-earnings',
    publishedAt: '2025-01-14T16:45:00Z',
    summary: 'Tesla reported record first-quarter earnings that surpassed analyst forecasts, driven by strong vehicle deliveries and improved margins.',
    content: 'Tesla Inc. reported record first-quarter earnings that exceeded Wall Street expectations, fueled by strong vehicle deliveries and higher profit margins. The electric vehicle maker reported earnings of $3.2 billion, or $2.70 per share, on revenue of $24.6 billion. Analysts had expected earnings of $2.15 per share on revenue of $23.8 billion. Tesla delivered 492,000 vehicles in the quarter, up 38% from a year earlier. The company also announced plans to accelerate its robotaxi program.',
    image: 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sentiment: 'positive',
    topics: ['Earnings', 'Automotive', 'Electric Vehicles'],
    entities: {
      companies: ['Tesla'],
      people: ['Elon Musk'],
      locations: ['Austin', 'Shanghai'],
      metrics: [
        { label: 'Earnings', value: '$3.2 billion' },
        { label: 'Revenue', value: '$24.6 billion' },
        { label: 'Vehicle Deliveries', value: '492,000' },
        { label: 'YoY Growth', value: '38%' }
      ]
    },
    score: 0.92
  },
  {
    id: '3',
    title: 'Amazon Announces Layoffs in Retail Division Amid Restructuring',
    source: 'Wall Street Journal',
    url: 'https://wsj.com/amazon-layoffs',
    publishedAt: '2025-01-13T12:15:00Z',
    summary: 'Amazon plans to cut 4,000 jobs in its retail division as part of a broader restructuring effort to reduce costs.',
    content: 'Amazon.com Inc. announced plans to lay off approximately 4,000 employees in its retail division as part of a broader restructuring initiative aimed at reducing costs and improving operational efficiency. The job cuts represent about 3% of Amazon\'s retail workforce worldwide. The company said the layoffs are necessary to realign resources toward high-growth areas such as AWS, advertising, and healthcare. Amazon has been facing pressure from investors to improve profitability in its core retail business.',
    image: 'https://images.pexels.com/photos/4199524/pexels-photo-4199524.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sentiment: 'negative',
    topics: ['Layoffs', 'E-commerce', 'Restructuring'],
    entities: {
      companies: ['Amazon'],
      people: ['Andy Jassy'],
      locations: ['Seattle'],
      metrics: [
        { label: 'Jobs Cut', value: '4,000' },
        { label: 'Percentage of Retail Workforce', value: '3%' }
      ]
    },
    score: 0.88
  },
  {
    id: '4',
    title: 'SEC Approves Spot Ethereum ETF, Opening Door for Broader Crypto Investment',
    source: 'CNBC',
    url: 'https://cnbc.com/sec-ethereum-etf',
    publishedAt: '2025-01-12T14:30:00Z',
    summary: 'The SEC has approved the first spot Ethereum ETF, potentially allowing more institutional investors to gain exposure to the cryptocurrency.',
    content: 'The U.S. Securities and Exchange Commission (SEC) has approved the first spot Ethereum exchange-traded fund (ETF), paving the way for broader institutional investment in the world\'s second-largest cryptocurrency. The approval follows months of speculation and comes after the successful launch of spot Bitcoin ETFs earlier. BlackRock, Fidelity, and VanEck are among the asset managers that have received approval to launch Ethereum ETFs. The funds are expected to begin trading next week on major U.S. exchanges.',
    image: 'https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sentiment: 'positive',
    topics: ['Cryptocurrency', 'Regulation', 'Investment'],
    entities: {
      companies: ['BlackRock', 'Fidelity', 'VanEck', 'SEC'],
      people: ['Gary Gensler'],
      locations: ['Washington D.C.'],
      metrics: []
    },
    score: 0.85
  },
  {
    id: '5',
    title: 'Google Cloud Partners with Walmart on AI-Powered Supply Chain Optimization',
    source: 'Reuters',
    url: 'https://reuters.com/google-walmart-ai',
    publishedAt: '2025-01-11T09:15:00Z',
    summary: 'Google Cloud and Walmart announce a strategic partnership to implement AI-driven supply chain optimization solutions.',
    content: 'Google Cloud and Walmart have announced a strategic partnership to develop and implement artificial intelligence solutions for supply chain optimization. The multi-year deal will see Walmart leveraging Google\'s advanced AI models to improve demand forecasting, inventory management, and logistics operations. The companies claim the partnership could reduce Walmart\'s logistics costs by up to 15% while decreasing out-of-stock incidents by 30%. This marks one of the largest enterprise AI deployments in the retail sector to date.',
    image: 'https://images.pexels.com/photos/2882634/pexels-photo-2882634.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sentiment: 'positive',
    topics: ['AI', 'Retail', 'Supply Chain'],
    entities: {
      companies: ['Google', 'Walmart'],
      people: ['Sundar Pichai', 'Doug McMillon'],
      locations: ['Mountain View', 'Bentonville'],
      metrics: [
        { label: 'Cost Reduction', value: '15%' },
        { label: 'Out-of-Stock Reduction', value: '30%' }
      ]
    },
    score: 0.82
  },
  {
    id: '6',
    title: 'Apple Delays Electric Vehicle Launch Amid Design Challenges',
    source: 'Financial Times',
    url: 'https://ft.com/apple-car-delay',
    publishedAt: '2025-01-10T11:20:00Z',
    summary: 'Apple has reportedly pushed back the launch of its electric vehicle by at least a year due to design and production challenges.',
    content: 'Apple Inc. has delayed the launch of its highly anticipated electric vehicle by at least a year, according to sources familiar with the matter. The project, codenamed "Titan," has faced significant design and production challenges. The delay reflects the difficulties in transitioning from consumer electronics to automotive manufacturing. Apple had originally planned to unveil the vehicle in 2026, but the launch is now expected no earlier than 2027. The company has reportedly scaled back some of the vehicle\'s autonomous features to focus on getting the product to market.',
    image: 'https://images.pexels.com/photos/842912/pexels-photo-842912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sentiment: 'negative',
    topics: ['Automotive', 'Electric Vehicles', 'Product Development'],
    entities: {
      companies: ['Apple'],
      people: ['Tim Cook'],
      locations: ['Cupertino'],
      metrics: [
        { label: 'Delay', value: '1+ year' },
        { label: 'New Launch Date', value: '2027' }
      ]
    },
    score: 0.79
  },
  {
    id: '7',
    title: 'JP Morgan Chase Completes Acquisition of European Fintech Firm for $2.5 Billion',
    source: 'Bloomberg',
    url: 'https://bloomberg.com/jpmorgan-fintech-acquisition',
    publishedAt: '2025-01-09T15:00:00Z',
    summary: 'JP Morgan Chase has finalized its $2.5 billion acquisition of a major European fintech company, expanding its digital banking capabilities.',
    content: 'JP Morgan Chase & Co. has completed the acquisition of a major European fintech firm for $2.5 billion, the bank announced today. The acquisition is part of JP Morgan\'s strategy to expand its digital banking capabilities and strengthen its presence in European markets. The fintech company, which offers banking-as-a-service solutions and has over 3 million users across Europe, will continue to operate under its own brand while integrating with JP Morgan\'s broader suite of financial services. The deal represents one of the largest fintech acquisitions by a traditional bank in recent years.',
    image: 'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sentiment: 'neutral',
    topics: ['Banking', 'Fintech', 'Mergers & Acquisitions'],
    entities: {
      companies: ['JP Morgan Chase'],
      people: ['Jamie Dimon'],
      locations: ['New York', 'London'],
      metrics: [
        { label: 'Acquisition Value', value: '$2.5 billion' },
        { label: 'Users', value: '3 million' }
      ]
    },
    score: 0.76
  },
  {
    id: '8',
    title: 'Climate Tech Startups Raise Record $45 Billion in Venture Funding',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/climate-tech-funding',
    publishedAt: '2025-01-08T10:45:00Z',
    summary: 'Climate technology startups raised a record $45 billion in venture capital funding last year, driven by growing interest in sustainable solutions.',
    content: 'Climate technology startups raised a record $45 billion in venture capital funding last year, according to a new report. The figure represents a 35% increase from the previous year and highlights growing investor interest in sustainable technologies. Carbon capture, green hydrogen, and battery technology attracted the largest investments. The report identified over 2,800 climate tech startups that received funding, with the average deal size increasing by 22%. The surge in funding comes as governments worldwide implement stricter emissions regulations and corporate sustainability commitments accelerate.',
    image: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    sentiment: 'positive',
    topics: ['Climate Tech', 'Venture Capital', 'Sustainability'],
    entities: {
      companies: ['Breakthrough Energy Ventures', 'Cleantech Ventures'],
      people: [],
      locations: ['Global'],
      metrics: [
        { label: 'Total Funding', value: '$45 billion' },
        { label: 'YoY Increase', value: '35%' },
        { label: 'Startups Funded', value: '2,800' },
        { label: 'Average Deal Size Increase', value: '22%' }
      ]
    },
    score: 0.73
  },
];

export const mockEntities: Entity[] = [
  {
    id: '1',
    name: 'OpenAI',
    type: 'company',
    count: 24,
    sentiment: { positive: 65, neutral: 30, negative: 5 },
    relatedEntities: [
      { id: '5', name: 'Microsoft', type: 'company', strength: 0.8 },
      { id: '10', name: 'Sam Altman', type: 'person', strength: 0.9 },
      { id: '15', name: 'GPT-5', type: 'metric', strength: 0.95 }
    ],
    recentMentions: [
      { newsId: '1', title: 'OpenAI Announces GPT-5 with Enhanced Business Intelligence Features', publishedAt: '2025-01-15T08:30:00Z' }
    ]
  },
  {
    id: '2',
    name: 'Tesla',
    type: 'company',
    count: 32,
    sentiment: { positive: 55, neutral: 25, negative: 20 },
    relatedEntities: [
      { id: '11', name: 'Elon Musk', type: 'person', strength: 0.95 },
      { id: '20', name: 'Electric Vehicles', type: 'metric', strength: 0.9 },
      { id: '25', name: 'Shanghai', type: 'location', strength: 0.7 }
    ],
    recentMentions: [
      { newsId: '2', title: 'Tesla Reports Record Q1 Earnings, Exceeds Analyst Expectations', publishedAt: '2025-01-14T16:45:00Z' }
    ]
  },
  {
    id: '3',
    name: 'Amazon',
    type: 'company',
    count: 28,
    sentiment: { positive: 40, neutral: 30, negative: 30 },
    relatedEntities: [
      { id: '12', name: 'Andy Jassy', type: 'person', strength: 0.8 },
      { id: '26', name: 'Seattle', type: 'location', strength: 0.7 },
      { id: '30', name: 'E-commerce', type: 'metric', strength: 0.9 }
    ],
    recentMentions: [
      { newsId: '3', title: 'Amazon Announces Layoffs in Retail Division Amid Restructuring', publishedAt: '2025-01-13T12:15:00Z' }
    ]
  },
  {
    id: '4',
    name: 'BlackRock',
    type: 'company',
    count: 15,
    sentiment: { positive: 60, neutral: 35, negative: 5 },
    relatedEntities: [
      { id: '35', name: 'ETF', type: 'metric', strength: 0.85 },
      { id: '36', name: 'Cryptocurrency', type: 'metric', strength: 0.7 },
      { id: '37', name: 'SEC', type: 'company', strength: 0.75 }
    ],
    recentMentions: [
      { newsId: '4', title: 'SEC Approves Spot Ethereum ETF, Opening Door for Broader Crypto Investment', publishedAt: '2025-01-12T14:30:00Z' }
    ]
  },
  {
    id: '5',
    name: 'Microsoft',
    type: 'company',
    count: 22,
    sentiment: { positive: 70, neutral: 25, negative: 5 },
    relatedEntities: [
      { id: '1', name: 'OpenAI', type: 'company', strength: 0.8 },
      { id: '40', name: 'Azure', type: 'metric', strength: 0.9 },
      { id: '41', name: 'Satya Nadella', type: 'person', strength: 0.85 }
    ],
    recentMentions: [
      { newsId: '1', title: 'OpenAI Announces GPT-5 with Enhanced Business Intelligence Features', publishedAt: '2025-01-15T08:30:00Z' }
    ]
  },
  {
    id: '10',
    name: 'Sam Altman',
    type: 'person',
    count: 18,
    sentiment: { positive: 60, neutral: 30, negative: 10 },
    relatedEntities: [
      { id: '1', name: 'OpenAI', type: 'company', strength: 0.9 },
      { id: '5', name: 'Microsoft', type: 'company', strength: 0.7 },
      { id: '15', name: 'GPT-5', type: 'metric', strength: 0.85 }
    ],
    recentMentions: [
      { newsId: '1', title: 'OpenAI Announces GPT-5 with Enhanced Business Intelligence Features', publishedAt: '2025-01-15T08:30:00Z' }
    ]
  },
  {
    id: '11',
    name: 'Elon Musk',
    type: 'person',
    count: 30,
    sentiment: { positive: 45, neutral: 25, negative: 30 },
    relatedEntities: [
      { id: '2', name: 'Tesla', type: 'company', strength: 0.95 },
      { id: '42', name: 'SpaceX', type: 'company', strength: 0.9 },
      { id: '43', name: 'Twitter', type: 'company', strength: 0.8 }
    ],
    recentMentions: [
      { newsId: '2', title: 'Tesla Reports Record Q1 Earnings, Exceeds Analyst Expectations', publishedAt: '2025-01-14T16:45:00Z' }
    ]
  },
  {
    id: '25',
    name: 'Shanghai',
    type: 'location',
    count: 12,
    sentiment: { positive: 65, neutral: 30, negative: 5 },
    relatedEntities: [
      { id: '2', name: 'Tesla', type: 'company', strength: 0.7 },
      { id: '44', name: 'China', type: 'location', strength: 0.9 },
      { id: '45', name: 'Manufacturing', type: 'metric', strength: 0.8 }
    ],
    recentMentions: [
      { newsId: '2', title: 'Tesla Reports Record Q1 Earnings, Exceeds Analyst Expectations', publishedAt: '2025-01-14T16:45:00Z' }
    ]
  },
];

export const mockTopics: Topic[] = [
  {
    id: '1',
    name: 'AI',
    count: 42,
    trending: true,
    sentiment: { positive: 70, neutral: 25, negative: 5 },
    topArticles: [
      { id: '1', title: 'OpenAI Announces GPT-5 with Enhanced Business Intelligence Features', source: 'TechCrunch' },
      { id: '5', title: 'Google Cloud Partners with Walmart on AI-Powered Supply Chain Optimization', source: 'Reuters' }
    ]
  },
  {
    id: '2',
    name: 'Electric Vehicles',
    count: 38,
    trending: true,
    sentiment: { positive: 60, neutral: 25, negative: 15 },
    topArticles: [
      { id: '2', title: 'Tesla Reports Record Q1 Earnings, Exceeds Analyst Expectations', source: 'Bloomberg' },
      { id: '6', title: 'Apple Delays Electric Vehicle Launch Amid Design Challenges', source: 'Financial Times' }
    ]
  },
  {
    id: '3',
    name: 'Layoffs',
    count: 25,
    trending: false,
    sentiment: { positive: 5, neutral: 30, negative: 65 },
    topArticles: [
      { id: '3', title: 'Amazon Announces Layoffs in Retail Division Amid Restructuring', source: 'Wall Street Journal' }
    ]
  },
  {
    id: '4',
    name: 'Cryptocurrency',
    count: 30,
    trending: true,
    sentiment: { positive: 55, neutral: 35, negative: 10 },
    topArticles: [
      { id: '4', title: 'SEC Approves Spot Ethereum ETF, Opening Door for Broader Crypto Investment', source: 'CNBC' }
    ]
  },
  {
    id: '5',
    name: 'Supply Chain',
    count: 28,
    trending: false,
    sentiment: { positive: 50, neutral: 40, negative: 10 },
    topArticles: [
      { id: '5', title: 'Google Cloud Partners with Walmart on AI-Powered Supply Chain Optimization', source: 'Reuters' }
    ]
  },
  {
    id: '6',
    name: 'Mergers & Acquisitions',
    count: 22,
    trending: false,
    sentiment: { positive: 45, neutral: 45, negative: 10 },
    topArticles: [
      { id: '7', title: 'JP Morgan Chase Completes Acquisition of European Fintech Firm for $2.5 Billion', source: 'Bloomberg' }
    ]
  },
  {
    id: '7',
    name: 'Climate Tech',
    count: 18,
    trending: true,
    sentiment: { positive: 75, neutral: 20, negative: 5 },
    topArticles: [
      { id: '8', title: 'Climate Tech Startups Raise Record $45 Billion in Venture Funding', source: 'TechCrunch' }
    ]
  },
];

export const mockSentiment: SentimentData = {
  positive: 55,
  neutral: 30,
  negative: 15,
  trends: [
    { date: '2025-01-01', positive: 50, neutral: 35, negative: 15 },
    { date: '2025-01-02', positive: 52, neutral: 33, negative: 15 },
    { date: '2025-01-03', positive: 48, neutral: 36, negative: 16 },
    { date: '2025-01-04', positive: 51, neutral: 34, negative: 15 },
    { date: '2025-01-05', positive: 49, neutral: 35, negative: 16 },
    { date: '2025-01-06', positive: 53, neutral: 32, negative: 15 },
    { date: '2025-01-07', positive: 54, neutral: 31, negative: 15 },
    { date: '2025-01-08', positive: 56, neutral: 30, negative: 14 },
    { date: '2025-01-09', positive: 52, neutral: 33, negative: 15 },
    { date: '2025-01-10', positive: 50, neutral: 34, negative: 16 },
    { date: '2025-01-11', positive: 53, neutral: 32, negative: 15 },
    { date: '2025-01-12', positive: 54, neutral: 31, negative: 15 },
    { date: '2025-01-13', positive: 51, neutral: 32, negative: 17 },
    { date: '2025-01-14', positive: 53, neutral: 31, negative: 16 },
    { date: '2025-01-15', positive: 55, neutral: 30, negative: 15 },
  ]
};