import { useState } from 'react';
import { User, Palette, Bell, Shield, Database, Building2, Edit2, FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { toast } from 'sonner';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company Profile', icon: Building2 },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data & Privacy', icon: Database },
];

const languages = [
  'English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Portuguese', 'Italian',
  'Dutch', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
];

const timezones = [
  'GMT-8 (Pacific Time)', 'GMT-7 (Mountain Time)', 'GMT-6 (Central Time)', 'GMT-5 (Eastern Time)',
  'GMT+0 (London)', 'GMT+1 (Paris)', 'GMT+5:30 (Mumbai)', 'GMT+8 (Singapore)', 'GMT+9 (Tokyo)'
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { data, updatePersonalInfo, updateBusinessInfo } = useOnboarding();
  const [activeTab, setActiveTab] = useState('profile');
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [editBusinessOpen, setEditBusinessOpen] = useState(false);

  // Local form state for editing
  const [personalForm, setPersonalForm] = useState(data.personal);
  const [businessForm, setBusinessForm] = useState(data.business);

  const handleSavePersonal = () => {
    updatePersonalInfo(personalForm);
    setEditPersonalOpen(false);
    toast.success('Personal profile updated!');
  };

  const handleSaveBusiness = () => {
    updateBusinessInfo(businessForm);
    setEditBusinessOpen(false);
    toast.success('Business profile updated!');
  };

  return (
    <div className="pb-16 lg:pb-0 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs Navigation */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 max-w-2xl">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Upload Photo</Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={data.personal.fullName || 'John Doe'} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={data.personal.email || 'john@company.com'} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" defaultValue={data.business.businessName || 'Acme Corporation'} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" defaultValue={data.personal.profession || 'Product Manager'} className="mt-1.5" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." className="mt-1.5" maxLength={500} />
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'company' && (
            <div className="space-y-6">
              {/* Personal Profile Summary */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Personal Profile</CardTitle>
                  <Dialog open={editPersonalOpen} onOpenChange={setEditPersonalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Personal Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Full Name</Label>
                          <Input
                            value={personalForm.fullName}
                            onChange={(e) => setPersonalForm({ ...personalForm, fullName: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={personalForm.email}
                            onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={personalForm.phone}
                            onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Textarea
                            value={personalForm.address}
                            onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Age</Label>
                            <Input
                              type="number"
                              value={personalForm.age}
                              onChange={(e) => setPersonalForm({ ...personalForm, age: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Profession</Label>
                            <Input
                              value={personalForm.profession}
                              onChange={(e) => setPersonalForm({ ...personalForm, profession: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Language</Label>
                            <Select value={personalForm.language} onValueChange={(v) => setPersonalForm({ ...personalForm, language: v })}>
                              <SelectTrigger className="mt-1.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Timezone</Label>
                            <Select value={personalForm.timezone} onValueChange={(v) => setPersonalForm({ ...personalForm, timezone: v })}>
                              <SelectTrigger className="mt-1.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timezones.map((tz) => (
                                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button onClick={handleSavePersonal} className="w-full">Save Changes</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium text-foreground">{data.personal.fullName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{data.personal.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{data.personal.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profession</p>
                      <p className="font-medium text-foreground">{data.personal.profession || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Language</p>
                      <p className="font-medium text-foreground">{data.personal.language || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Timezone</p>
                      <p className="font-medium text-foreground">{data.personal.timezone || '-'}</p>
                    </div>
                  </div>
                  {data.personal.address && (
                    <div className="mt-4">
                      <p className="text-muted-foreground text-sm">Address</p>
                      <p className="font-medium text-foreground text-sm">{data.personal.address}</p>
                    </div>
                  )}
                  {data.personal.oauthProvider && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        Connected with {data.personal.oauthProvider}
                      </span>
                      <Button variant="ghost" size="sm">Sync with Google</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Profile Summary */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Business Profile</CardTitle>
                  <Dialog open={editBusinessOpen} onOpenChange={setEditBusinessOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Business Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Business Name</Label>
                          <Input
                            value={businessForm.businessName}
                            onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Purpose</Label>
                          <Input
                            value={businessForm.purpose}
                            onChange={(e) => setBusinessForm({ ...businessForm, purpose: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Website</Label>
                          <Input
                            type="url"
                            value={businessForm.website}
                            onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Industry</Label>
                            <Input
                              value={businessForm.industry}
                              onChange={(e) => setBusinessForm({ ...businessForm, industry: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Company Size</Label>
                            <Input
                              value={businessForm.companySize}
                              onChange={(e) => setBusinessForm({ ...businessForm, companySize: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Region</Label>
                          <Input
                            value={businessForm.region}
                            onChange={(e) => setBusinessForm({ ...businessForm, region: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <Button onClick={handleSaveBusiness} className="w-full">Save Changes</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Business Name</p>
                      <p className="font-medium text-foreground">{data.business.businessName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Purpose</p>
                      <p className="font-medium text-foreground">{data.business.purpose || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Industry</p>
                      <p className="font-medium text-foreground">{data.business.industry || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Company Size</p>
                      <p className="font-medium text-foreground">{data.business.companySize || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Website</p>
                      <p className="font-medium text-foreground">{data.business.website || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Region</p>
                      <p className="font-medium text-foreground">{data.business.region || '-'}</p>
                    </div>
                  </div>

                  {/* Documents */}
                  {data.business.documents.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-foreground">Uploaded Documents</h4>
                        <Button variant="ghost" size="sm">Manage Documents</Button>
                      </div>
                      <div className="space-y-2">
                        {data.business.documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm text-foreground flex-1 truncate">{doc.name}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Theme</Label>
                  <div className="flex gap-2 mt-2">
                    {['light', 'dark'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t as 'light' | 'dark')}
                        className={cn(
                          'px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-all',
                          theme === t
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <select id="language" className="mt-1.5 w-full h-10 px-3 rounded-lg border border-input bg-background">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="timezone">Time Zone</Label>
                  <select id="timezone" className="mt-1.5 w-full h-10 px-3 rounded-lg border border-input bg-background">
                    <option>GMT-5 (Eastern Time - US & Canada)</option>
                    <option>GMT-8 (Pacific Time)</option>
                    <option>GMT (London)</option>
                    <option>GMT+1 (Paris)</option>
                  </select>
                </div>

                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Email Notifications</h4>
                  {[
                    { id: 'newConv', label: 'New conversation started', defaultChecked: true },
                    { id: 'attention', label: 'Bot requires attention', defaultChecked: true },
                    { id: 'daily', label: 'Daily activity summary', defaultChecked: true },
                    { id: 'weekly', label: 'Weekly performance report', defaultChecked: true },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                      <Switch id={item.id} defaultChecked={item.defaultChecked} />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">System Notifications</h4>
                  {[
                    { id: 'training', label: 'Bot training completed', defaultChecked: true },
                    { id: 'billing', label: 'Billing updates', defaultChecked: true },
                    { id: 'security', label: 'Security alerts', defaultChecked: true },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                      <Switch id={item.id} defaultChecked={item.defaultChecked} />
                    </div>
                  ))}
                </div>

                <Button>Save Notification Settings</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-4">Change Password</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" className="mt-1.5" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'data' && (
            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a copy of all your data including bots, conversations, and settings.
                  </p>
                  <Button variant="outline">Request Data Export</Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-2">Privacy Settings</h4>
                  <div className="space-y-4">
                    {[
                      { id: 'analytics', label: 'Allow usage analytics', defaultChecked: true },
                      { id: 'research', label: 'Share anonymized data for research', defaultChecked: false },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                        <Switch id={item.id} defaultChecked={item.defaultChecked} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all data.
                  </p>
                  <Button variant="destructive">Delete My Account</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
