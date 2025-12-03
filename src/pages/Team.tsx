import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Mail, Shield, Eye, Edit2, Trash2, Clock, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockTeamMembers } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const roleColors: Record<string, string> = {
  Owner: 'bg-primary/10 text-primary',
  Admin: 'bg-chart-2/10 text-chart-2',
  Member: 'bg-success/10 text-success',
  Viewer: 'bg-muted text-muted-foreground',
};

export default function Team() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredMembers = mockTeamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: mockTeamMembers.length,
    active: mockTeamMembers.filter((m) => m.status === 'active').length,
    pending: mockTeamMembers.filter((m) => m.status === 'pending').length,
    admins: mockTeamMembers.filter((m) => m.role === 'Admin' || m.role === 'Owner').length,
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
        <Button onClick={() => setInviteModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.active}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.admins}</p>
            <p className="text-sm text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Team Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Member</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Last Active</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{member.avatar}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', roleColors[member.role])}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className={cn(
                        'flex items-center gap-1 text-sm',
                        member.status === 'active' ? 'text-success' : 'text-warning'
                      )}>
                        {member.status === 'active' ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                        {member.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{member.lastActive}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                          {openMenu === member.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                              <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-elevation-3 py-1 z-50">
                                {member.role !== 'Owner' && (
                                  <>
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                                      <Edit2 className="w-4 h-4" /> Edit Role
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                                      <Eye className="w-4 h-4" /> View Activity
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent">
                                      <Trash2 className="w-4 h-4" /> Remove
                                    </button>
                                  </>
                                )}
                                {member.status === 'pending' && (
                                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                                    <Mail className="w-4 h-4" /> Resend Invite
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input id="inviteEmail" type="email" placeholder="colleague@company.com" className="mt-1.5" />
            </div>

            <div>
              <Label>Assign Role</Label>
              <div className="space-y-2 mt-2">
                {['Admin', 'Member', 'Viewer'].map((role) => (
                  <label key={role} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
                    <input type="radio" name="role" value={role} className="mt-1" defaultChecked={role === 'Member'} />
                    <div>
                      <p className="font-medium text-foreground">{role}</p>
                      <p className="text-xs text-muted-foreground">
                        {role === 'Admin' && 'Full access except billing'}
                        {role === 'Member' && 'Can create and edit bots'}
                        {role === 'Viewer' && 'Read-only access to analytics'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setInviteModalOpen(false)}>
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
