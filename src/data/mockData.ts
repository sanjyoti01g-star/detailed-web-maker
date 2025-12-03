export const mockBots = [
  {
    id: 'bot_1',
    name: 'Customer Support Bot',
    description: 'Handles common customer inquiries and support tickets',
    avatar: '🤖',
    status: 'active' as const,
    category: 'Customer Support',
    messagesToday: 234,
    totalConversations: 4567,
    avgRating: 4.7,
    responseTime: '1.1s',
    createdAt: '2024-11-01',
  },
  {
    id: 'bot_2',
    name: 'Sales Assistant',
    description: 'Qualifies leads and schedules demos',
    avatar: '💼',
    status: 'active' as const,
    category: 'Sales',
    messagesToday: 189,
    totalConversations: 2340,
    avgRating: 4.5,
    responseTime: '1.3s',
    createdAt: '2024-11-15',
  },
  {
    id: 'bot_3',
    name: 'Product Finder',
    description: 'Helps customers find the right products',
    avatar: '🛒',
    status: 'active' as const,
    category: 'E-commerce',
    messagesToday: 156,
    totalConversations: 1890,
    avgRating: 4.8,
    responseTime: '0.9s',
    createdAt: '2024-11-20',
  },
  {
    id: 'bot_4',
    name: 'FAQ Bot',
    description: 'Answers frequently asked questions',
    avatar: '❓',
    status: 'paused' as const,
    category: 'Customer Support',
    messagesToday: 0,
    totalConversations: 890,
    avgRating: 4.2,
    responseTime: '0.8s',
    createdAt: '2024-10-15',
  },
  {
    id: 'bot_5',
    name: 'Onboarding Guide',
    description: 'Helps new users get started',
    avatar: '🚀',
    status: 'active' as const,
    category: 'Education',
    messagesToday: 78,
    totalConversations: 567,
    avgRating: 4.9,
    responseTime: '1.0s',
    createdAt: '2024-12-01',
  },
];

export const mockDocuments = [
  { id: 'doc_1', name: 'Product Catalog 2024.pdf', type: 'PDF', size: '2.3 MB', uploadDate: '2024-12-01', usedIn: 3, status: 'processed' as const },
  { id: 'doc_2', name: 'FAQ Master List.docx', type: 'DOCX', size: '845 KB', uploadDate: '2024-11-28', usedIn: 5, status: 'processed' as const },
  { id: 'doc_3', name: 'https://docs.example.com', type: 'URL', size: '-', uploadDate: '2024-11-25', usedIn: 1, status: 'processing' as const },
  { id: 'doc_4', name: 'Training Manual.pdf', type: 'PDF', size: '5.1 MB', uploadDate: '2024-11-20', usedIn: 0, status: 'failed' as const },
  { id: 'doc_5', name: 'Support Guide.txt', type: 'TXT', size: '156 KB', uploadDate: '2024-11-15', usedIn: 2, status: 'processed' as const },
];

export const mockTeamMembers = [
  { id: 'user_1', name: 'John Doe', email: 'john@company.com', role: 'Owner', status: 'active', lastActive: '2 min ago', avatar: 'JD' },
  { id: 'user_2', name: 'Sarah Miller', email: 'sarah@company.com', role: 'Admin', status: 'active', lastActive: '1 hour ago', avatar: 'SM' },
  { id: 'user_3', name: 'Mike Johnson', email: 'mike@company.com', role: 'Member', status: 'active', lastActive: '3 hours ago', avatar: 'MJ' },
  { id: 'user_4', name: 'Emily Wilson', email: 'emily@company.com', role: 'Member', status: 'active', lastActive: '1 day ago', avatar: 'EW' },
  { id: 'user_5', name: 'David Brown', email: 'david@company.com', role: 'Viewer', status: 'pending', lastActive: 'Not yet', avatar: 'DB' },
];

export const mockApiKeys = [
  { id: 'key_1', name: 'Production API', key: 'sk_live_•••abc123', permissions: 'Full Access', created: '2024-12-01', lastUsed: '2 min ago', status: 'active' },
  { id: 'key_2', name: 'Development Key', key: 'sk_test_•••xyz789', permissions: 'Read Only', created: '2024-11-15', lastUsed: '1 hour ago', status: 'active' },
  { id: 'key_3', name: 'Mobile App v2', key: 'sk_live_•••def456', permissions: 'Write', created: '2024-10-20', lastUsed: '5 days ago', status: 'active' },
];

export const mockActivity = [
  { id: 1, user: 'Sarah Miller', action: 'created new bot "Sales Assistant"', time: '2 hours ago', type: 'bot' },
  { id: 2, user: 'Mike Johnson', action: 'uploaded "Product Catalog.pdf"', time: '4 hours ago', type: 'document' },
  { id: 3, user: 'Emily Wilson', action: 'edited bot "Support Bot"', time: '5 hours ago', type: 'bot' },
  { id: 4, user: 'John Doe', action: 'invited David Brown', time: '1 day ago', type: 'team' },
  { id: 5, user: 'Sarah Miller', action: 'connected Slack integration', time: '1 day ago', type: 'integration' },
];

export const mockAnalyticsData = {
  conversations: [
    { date: 'Nov 1', value: 1234 },
    { date: 'Nov 8', value: 1567 },
    { date: 'Nov 15', value: 1890 },
    { date: 'Nov 22', value: 1654 },
    { date: 'Nov 29', value: 2103 },
    { date: 'Dec 3', value: 2340 },
  ],
  popularQuestions: [
    { question: 'What are your hours?', count: 847 },
    { question: 'How do I reset password?', count: 623 },
    { question: 'Pricing information?', count: 512 },
    { question: 'Product availability?', count: 445 },
    { question: 'Contact support?', count: 389 },
  ],
  satisfaction: [
    { rating: '5 stars', value: 58, count: 2256 },
    { rating: '4 stars', value: 28, count: 1089 },
    { rating: '3 stars', value: 9, count: 350 },
    { rating: '2 stars', value: 3, count: 117 },
    { rating: '1 star', value: 2, count: 78 },
  ],
};

export const mockTemplates = [
  {
    id: 'tpl_1',
    name: 'Customer Support Bot',
    category: 'Customer Support',
    rating: 4.9,
    uses: 1234,
    description: 'Handle common support queries, ticket creation, and FAQ responses',
    features: ['FAQ automation', 'Ticket routing', 'Business hours info'],
  },
  {
    id: 'tpl_2',
    name: 'E-commerce Shopping Assistant',
    category: 'E-commerce',
    rating: 4.7,
    uses: 856,
    description: 'Help customers find products, check inventory, and track orders',
    features: ['Product search', 'Order tracking', 'Size guides'],
  },
  {
    id: 'tpl_3',
    name: 'Lead Qualification Bot',
    category: 'Sales & Marketing',
    rating: 4.8,
    uses: 623,
    description: 'Qualify leads with smart questions and route to sales team',
    features: ['Lead scoring', 'CRM integration', 'Meeting scheduler'],
  },
  {
    id: 'tpl_4',
    name: 'Appointment Booking Bot',
    category: 'Healthcare',
    rating: 4.6,
    uses: 445,
    description: 'Let customers book appointments 24/7 with calendar integration',
    features: ['Real-time availability', 'Reminders', 'Rescheduling'],
  },
  {
    id: 'tpl_5',
    name: 'HR Onboarding Assistant',
    category: 'HR & Recruitment',
    rating: 4.5,
    uses: 334,
    description: 'Guide new employees through onboarding process',
    features: ['Document collection', 'Policy info', 'FAQ'],
  },
];

export const mockIntegrations = [
  { id: 'int_1', name: 'Slack', category: 'Messaging', connected: true, description: 'Send bot conversations to Slack channels' },
  { id: 'int_2', name: 'Discord', category: 'Messaging', connected: false, description: 'Deploy your bot to Discord servers' },
  { id: 'int_3', name: 'WhatsApp Business', category: 'Messaging', connected: false, description: 'Reach customers on WhatsApp' },
  { id: 'int_4', name: 'Salesforce', category: 'CRM', connected: false, description: 'Sync conversations and leads to Salesforce' },
  { id: 'int_5', name: 'HubSpot', category: 'CRM', connected: true, description: 'Integrate with HubSpot CRM' },
  { id: 'int_6', name: 'Shopify', category: 'E-commerce', connected: false, description: 'Add chatbot to your Shopify store' },
  { id: 'int_7', name: 'Zapier', category: 'Productivity', connected: true, description: 'Connect to 5,000+ apps with Zapier' },
  { id: 'int_8', name: 'Google Analytics', category: 'Analytics', connected: true, description: 'Track bot interactions in GA' },
  { id: 'int_9', name: 'Zendesk', category: 'Help Desk', connected: false, description: 'Create tickets from conversations' },
];

export const mockConversations = [
  { role: 'bot' as const, text: 'Hi! How can I help you today?', timestamp: '12:30 PM' },
  { role: 'user' as const, text: 'What are your business hours?', timestamp: '12:31 PM' },
  { role: 'bot' as const, text: "We're open Monday-Friday, 9am-6pm EST. How else can I help you?", timestamp: '12:31 PM' },
];
