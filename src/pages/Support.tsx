import { useState } from 'react';
import { Search, Book, Video, MessageCircle, Mail, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const quickLinks = [
  { icon: Book, label: 'Docs', description: 'Browse Articles' },
  { icon: Video, label: 'Videos', description: 'Watch Tutorials' },
  { icon: MessageCircle, label: 'Forum', description: 'Community Support' },
  { icon: Mail, label: 'Email', description: 'Contact Us' },
];

const helpCategories = [
  { title: 'Getting Started', articles: 12, items: ['How to create your first chatbot', 'Understanding the dashboard', 'Inviting team members'] },
  { title: 'Building & Training Bots', articles: 18, items: ['Uploading training documents', 'Adding website content', 'Customizing bot personality'] },
  { title: 'Embedding & Integration', articles: 15, items: ['JavaScript embed code', 'WordPress plugin setup', 'Shopify app installation'] },
  { title: 'Analytics & Reporting', articles: 9, items: ['Understanding analytics dashboard', 'Exporting reports', 'Tracking conversions'] },
];

const faqs = [
  { question: 'How do I create a chatbot?', answer: 'Click "Create New Bot" from the dashboard, enter a name and description, upload training documents, and customize the appearance and personality.' },
  { question: 'Can I use my bot on multiple websites?', answer: "Yes! You can add multiple domains to your whitelist in the Embed tab of your bot settings." },
  { question: 'How is pricing calculated?', answer: 'Pricing is based on your plan tier and number of conversations per month.' },
  { question: 'Can I export my data?', answer: 'Yes, go to Settings > Data & Privacy to export all your data in JSON or CSV format.' },
  { question: 'What integrations are available?', answer: 'We support 50+ integrations including Slack, Shopify, Salesforce, and more.' },
];

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Getting Started');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="space-y-6 pb-16 lg:pb-0 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Support Center</h1>
        <p className="text-muted-foreground mb-6">Find answers, get help, and learn how to use our platform</p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 text-base"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Card key={link.label} className="cursor-pointer hover:shadow-elevation-2 hover:border-primary/30 transition-all text-center">
            <CardContent className="py-6">
              <link.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="font-medium text-foreground">{link.label}</p>
              <p className="text-sm text-muted-foreground">{link.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popular Topics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: '🚀', title: 'Getting Started', items: ['Creating your first bot', 'Training with documents', 'Embedding on your site'] },
          { icon: '💳', title: 'Billing & Plans', items: ['Upgrade your plan', 'Payment methods', 'Invoices & receipts'] },
          { icon: '🔌', title: 'Integrations', items: ['Connect to Slack', 'Shopify integration', 'API documentation'] },
          { icon: '🛠️', title: 'Troubleshooting', items: ['Bot not responding', 'Training failures', 'Widget not appearing'] },
        ].map((topic) => (
          <Card key={topic.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="text-xl">{topic.icon}</span>
                {topic.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {topic.items.map((item) => (
                  <li key={item}>
                    <button className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
              <Button variant="link" className="mt-2 p-0 h-auto text-sm">
                View All Articles →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Help Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {helpCategories.map((category) => (
            <div key={category.title} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.title ? null : category.title)}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
              >
                <span className="font-medium text-foreground">
                  {category.title} ({category.articles} articles)
                </span>
                <ChevronDown className={cn(
                  'w-4 h-4 text-muted-foreground transition-transform',
                  expandedCategory === category.title && 'rotate-180'
                )} />
              </button>
              {expandedCategory === category.title && (
                <div className="px-4 pb-4 space-y-2">
                  {category.items.map((item) => (
                    <button key={item} className="w-full text-left text-sm text-muted-foreground hover:text-primary p-2 hover:bg-accent/30 rounded">
                      • {item}
                    </button>
                  ))}
                  <Button variant="link" className="p-0 h-auto text-sm">View all →</Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left"
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                <ChevronDown className={cn(
                  'w-4 h-4 text-muted-foreground transition-transform flex-shrink-0',
                  expandedFaq === index && 'rotate-180'
                )} />
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Brief description of your issue" className="mt-1.5" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select id="category" className="mt-1.5 w-full h-10 px-3 rounded-lg border border-input bg-background">
                <option>Technical Issue</option>
                <option>Billing</option>
                <option>Account</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select id="priority" className="mt-1.5 w-full h-10 px-3 rounded-lg border border-input bg-background">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please describe your issue in detail..."
              className="mt-1.5 min-h-[120px]"
            />
          </div>
          <Button>Submit Ticket</Button>
        </CardContent>
      </Card>
    </div>
  );
}
