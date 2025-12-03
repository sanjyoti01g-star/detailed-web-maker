import { Bot, MessageSquare, Users, Clock, Plus, Upload, BarChart3, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockBots, mockActivity } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

const kpis = [
  { icon: Bot, label: 'Total Chatbots', value: '12', trend: '+3 this month', up: true },
  { icon: MessageSquare, label: 'Total Conversations', value: '45,234', trend: '↑ +18% from last month', up: true },
  { icon: Users, label: 'Active Users', value: '3,891', trend: '↑ +7% from last month', up: true },
  { icon: Clock, label: 'Avg Response Time', value: '1.2s', trend: '↓ -15% (improvement)', up: true },
];

const quickActions = [
  { icon: Plus, label: 'Create New Bot', description: 'Build a new chatbot', path: '/chatbots/new' },
  { icon: Upload, label: 'Upload Documents', description: 'Add training data', path: '/documents' },
  { icon: BarChart3, label: 'View Analytics', description: 'Check performance', path: '/analytics' },
  { icon: UserPlus, label: 'Invite Team Member', description: 'Grow your team', path: '/team' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 pb-16 lg:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, John! 👋</h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
        <Button onClick={() => navigate('/chatbots/new')} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Create New Bot
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="hover:shadow-elevation-2 transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-primary/10">
                  <kpi.icon className="w-5 h-5 text-primary" />
                </div>
                {kpi.up ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-xs text-success mt-1">{kpi.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              className="cursor-pointer hover:shadow-elevation-2 hover:border-primary/50 transition-all group"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="pt-6">
                <div className="p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                  <action.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mt-4">{action.label}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Bots */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Bots</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/chatbots')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBots.slice(0, 4).map((bot) => (
                <div
                  key={bot.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/chatbots/${bot.id}`)}
                >
                  <div className="text-2xl">{bot.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground truncate">{bot.name}</h4>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          bot.status === 'active' ? 'bg-success' : 'bg-warning'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {bot.messagesToday} messages today • {bot.avgRating}★
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
