import { useState } from 'react';
import { Search, Star, Eye, ArrowRight, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { mockTemplates } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const categories = ['All Templates', 'Customer Support', 'Sales & Marketing', 'E-commerce', 'Education', 'Healthcare', 'HR & Recruitment', 'Real Estate', 'Finance'];

export default function Templates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Templates');

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Templates' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-16 lg:pb-0 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Template Library</h1>
        <p className="text-muted-foreground">Start with pre-built templates to create your chatbot faster</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-elevation-2 transition-all group">
            {/* Template Preview */}
            <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-3xl">🤖</span>
              </div>
            </div>
            
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{template.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                    {template.category}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {template.description}
              </p>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="flex items-center gap-1 text-foreground">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  {template.rating}
                </span>
                <span className="text-muted-foreground">
                  {template.uses.toLocaleString()} uses
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {template.features.slice(0, 3).map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-2 py-1 bg-primary/5 text-primary rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => navigate('/chatbots/new')}>
                  Use Template
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found matching your search.</p>
        </div>
      )}
    </div>
  );
}
