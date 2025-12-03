import { useState } from 'react';
import { Search, Check, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { mockIntegrations } from '@/data/mockData';
import { cn } from '@/lib/utils';

const categories = ['All Categories', 'Messaging', 'CRM', 'E-commerce', 'Analytics', 'Productivity', 'Help Desk'];

const integrationIcons: Record<string, string> = {
  Slack: '💬',
  Discord: '🎮',
  'WhatsApp Business': '📱',
  Salesforce: '☁️',
  HubSpot: '🧲',
  Shopify: '🛒',
  Zapier: '⚡',
  'Google Analytics': '📊',
  Zendesk: '🎫',
};

export default function Integrations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const connectedIntegrations = mockIntegrations.filter((i) => i.connected);
  
  const filteredIntegrations = mockIntegrations.filter((integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-16 lg:pb-0 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations Marketplace</h1>
        <p className="text-muted-foreground">Connect your chatbots with your favorite tools</p>
      </div>

      {/* Connected Integrations */}
      {connectedIntegrations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Connected Integrations</h2>
          <div className="flex flex-wrap gap-3">
            {connectedIntegrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg"
              >
                <span className="text-2xl">{integrationIcons[integration.name] || '🔗'}</span>
                <div>
                  <p className="font-medium text-foreground">{integration.name}</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Connected
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-elevation-2 transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {integrationIcons[integration.name] || '🔗'}
                </div>
                {integration.connected && (
                  <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                    <Check className="w-3 h-3" />
                    Connected
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-foreground mb-1">{integration.name}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {integration.category}
              </span>

              <p className="text-sm text-muted-foreground my-4">
                {integration.description}
              </p>

              <Button
                variant={integration.connected ? 'outline' : 'default'}
                className="w-full"
              >
                {integration.connected ? (
                  <>
                    <Settings className="w-4 h-4" />
                    Configure
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Connect
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
