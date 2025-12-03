import { Check, CreditCard, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const plans = [
  { id: 'free', name: 'Free', price: 0, current: false },
  { id: 'pro', name: 'Pro', price: 29, current: true },
  { id: 'enterprise', name: 'Enterprise', price: 99, current: false },
];

const usage = [
  { label: 'Conversations', used: 8234, total: 10000, percentage: 82 },
  { label: 'Chatbots', used: 5, total: 10, percentage: 50 },
  { label: 'Team Members', used: 3, total: 5, percentage: 60 },
  { label: 'Storage', used: 4.2, total: 10, percentage: 42, unit: 'GB' },
];

const billingHistory = [
  { date: 'Dec 1, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
  { date: 'Nov 1, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
  { date: 'Oct 1, 2024', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
  { date: 'Sep 15, 2024', description: 'Upgrade to Pro', amount: '$19.00', status: 'Paid' },
];

export default function Billing() {
  return (
    <div className="space-y-6 pb-16 lg:pb-0 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and payment methods</p>
      </div>

      {/* Current Plan */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Pro Plan</h3>
                <p className="text-sm text-muted-foreground">$29.00 / month • Billed monthly</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="ghost" className="text-destructive">Cancel</Button>
            </div>
          </div>
          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-sm text-warning flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Switch to Annual Billing and Save 20%! Pay $278/year instead of $348/year
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {usage.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-sm text-muted-foreground">
                  {item.used}{item.unit ? ` ${item.unit}` : ''} / {item.total}{item.unit ? ` ${item.unit}` : ''}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    item.percentage > 80 ? 'bg-warning' : 'bg-primary'
                  )}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-sm text-muted-foreground pt-2">Resets on: Jan 1, 2025</p>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment Method</CardTitle>
          <Button variant="outline" size="sm">Add Payment Method</Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="w-12 h-8 bg-card border border-border rounded flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Visa ending in 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/2025</p>
            </div>
            <span className="px-2 py-1 text-xs bg-success/10 text-success rounded-full">Default</span>
            <Button variant="ghost" size="sm">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Billing History</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((item, index) => (
                  <tr key={index} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4 text-foreground">{item.date}</td>
                    <td className="py-3 px-4 text-foreground">{item.description}</td>
                    <td className="py-3 px-4 text-foreground">{item.amount}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-success text-sm">
                        <Check className="w-3 h-3" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
