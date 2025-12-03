import { useState } from 'react';
import { Plus, Search, FileText, Globe, Upload, Download, Trash2, Eye, RefreshCw, X, File, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { mockDocuments } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const filteredDocs = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || doc.type.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'URL') return <Globe className="w-5 h-5 text-primary" />;
    return <FileText className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Upload Documents
        </Button>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Storage Used</span>
            <span className="text-sm text-muted-foreground">4.2 GB / 10 GB</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '42%' }} />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
        >
          <option value="all">All Types</option>
          <option value="pdf">PDFs</option>
          <option value="docx">Word Documents</option>
          <option value="txt">Text Files</option>
          <option value="url">Web URLs</option>
        </select>
      </div>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Document</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Size</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Uploaded</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Used In</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(doc.type)}
                        <span className="font-medium text-foreground truncate max-w-[200px]">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className="px-2 py-1 text-xs font-medium bg-muted rounded-full text-muted-foreground">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{doc.size}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{doc.uploadDate}</td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="text-primary font-medium">{doc.usedIn} bots</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <span className={cn(
                          'text-sm capitalize',
                          doc.status === 'processed' && 'text-success',
                          doc.status === 'processing' && 'text-primary',
                          doc.status === 'failed' && 'text-destructive'
                        )}>
                          {doc.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {doc.type !== 'URL' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {doc.status === 'failed' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
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

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">Drag & drop files here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <p className="text-xs text-muted-foreground">
                Supported: PDF, DOCX, TXT, CSV (Max 10MB per file)
              </p>
            </div>

            {/* URL Input */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Or add a URL:</p>
              <div className="flex gap-2">
                <Input placeholder="https://example.com/docs" className="flex-1" />
                <Button variant="outline">Add URL</Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setUploadModalOpen(false)}>
                Upload All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
