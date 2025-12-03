import { useState } from 'react';
import { Plus, Copy, Eye, EyeOff, Settings, Trash2, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockApiKeys } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function ApiKeys() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'API key copied to clipboard',
    });
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Keys & Webhooks</h1>
          <p className="text-muted-foreground">Manage your API credentials and webhook endpoints</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4" />
            View Docs
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Create API Key
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '📖', label: 'API Documentation', desc: 'Full reference' },
          { icon: '💡', label: 'Quick Start Guide', desc: 'Get started' },
          { icon: '🧪', label: 'API Playground', desc: 'Test endpoints' },
          { icon: '📊', label: 'Usage Statistics', desc: 'View usage' },
        ].map((item) => (
          <Card key={item.label} className="cursor-pointer hover:shadow-elevation-2 hover:border-primary/30 transition-all">
            <CardContent className="py-4">
              <span className="text-2xl">{item.icon}</span>
              <p className="font-medium text-foreground mt-2">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Key</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Permissions</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Last Used</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockApiKeys.map((key) => (
                  <tr key={key.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{key.name}</p>
                      <p className="text-xs text-muted-foreground">Created {key.created}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {showKeys[key.id] ? 'sk_live_xJ9k2mP4nQ8rT7vY3aB5' : key.key}
                        </code>
                        <button
                          onClick={() => setShowKeys({ ...showKeys, [key.id]: !showKeys[key.id] })}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {showKeys[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{key.permissions}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">{key.lastUsed}</td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        key.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      )}>
                        {key.status === 'active' ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(key.key)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Key Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="keyName">Key Name</Label>
              <Input id="keyName" placeholder="Production API Key" className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">For internal reference only</p>
            </div>

            <div>
              <Label>Access Level</Label>
              <div className="space-y-2 mt-2">
                {['Read Only', 'Read & Write', 'Full Access'].map((level) => (
                  <label key={level} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
                    <input type="radio" name="access" value={level} className="mt-1" defaultChecked={level === 'Full Access'} />
                    <div>
                      <p className="font-medium text-foreground">{level}</p>
                      <p className="text-xs text-muted-foreground">
                        {level === 'Read Only' && 'Can only fetch data'}
                        {level === 'Read & Write' && 'Can send messages, update bots'}
                        {level === 'Full Access' && 'Complete control (create, delete)'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setCreateModalOpen(false)}>
                Generate Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
