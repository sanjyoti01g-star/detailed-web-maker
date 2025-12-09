import { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Upload, X, FileText, File, FileSpreadsheet, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingProgress } from './OnboardingProgress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const purposes = [
  'Customer Support',
  'Sales Automation',
  'FAQ & Knowledge Base',
  'E-commerce Assistant',
  'Lead Generation',
  'Internal Helpdesk',
  'Other',
];

const industries = [
  'E-commerce', 'Healthcare', 'Finance', 'Education', 'Real Estate',
  'Technology', 'Marketing', 'Consulting', 'Retail', 'Manufacturing',
  'Legal', 'Insurance', 'Travel', 'Food & Beverage', 'Other',
];

const companySizes = ['Solo', '2-10', '11-50', '51-200', '201-1000', '1000+'];

const regions = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
  'Spain', 'Italy', 'Netherlands', 'Australia', 'Japan', 'China',
  'India', 'Brazil', 'Mexico', 'Other',
];

const recommendedDocs = [
  { name: 'Business registration / certificate', key: 'registration' },
  { name: 'Proof of address', key: 'address' },
  { name: 'Product catalog', key: 'catalog' },
  { name: 'Terms & conditions / policy', key: 'terms' },
  { name: 'Existing FAQ document', key: 'faq' },
  { name: 'Employee handbook', key: 'handbook' },
];

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  url: string;
  isRecommended: boolean;
}

export function BusinessInfoScreen() {
  const { setStep, data, updateBusinessInfo } = useOnboarding();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    data.business.documents.map(doc => ({
      ...doc,
      isRecommended: recommendedDocs.some(rd => doc.name.toLowerCase().includes(rd.key))
    }))
  );

  // Allow continuing with minimal info for testing
  const isValid = true;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFiles = (files: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach((file) => {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv', 'text/plain'];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|csv|txt)$/i)) {
        toast.error(`${file.name} is not a supported file type`);
        return;
      }
      
      const isRecommended = recommendedDocs.some(rd => 
        file.name.toLowerCase().includes(rd.key)
      );

      newFiles.push({
        name: file.name,
        type: file.type || 'unknown',
        size: file.size,
        url: URL.createObjectURL(file),
        isRecommended,
      });
    });

    const allFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(allFiles);
    updateBusinessInfo({ 
      documents: allFiles.map(f => ({ name: f.name, type: f.type, size: f.size, url: f.url }))
    });
    
    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} file(s) uploaded`);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [uploadedFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    updateBusinessInfo({ 
      documents: newFiles.map(f => ({ name: f.name, type: f.type, size: f.size, url: f.url }))
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (type.includes('spreadsheet') || type.includes('csv')) return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
    return <File className="w-4 h-4 text-blue-500" />;
  };

  const handleContinue = () => {
    if (isValid) {
      toast.success('Business info saved!');
      setStep(4); // Move to Choose Plan
    }
  };

  const handleSkip = () => {
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full animate-fade-in">
        <OnboardingProgress currentStep={3} totalSteps={6} />
        
        <div className="mt-6 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            Section 2 of 2
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-elevation-2 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Business Info</h2>
          <p className="text-muted-foreground mb-6">Help us understand your business needs</p>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
            <div>
              <Label htmlFor="purpose">Purpose to Use App *</Label>
              <Select value={data.business.purpose} onValueChange={(value) => updateBusinessInfo({ purpose: value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select your primary use case" />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Why this matters: We'll customize your experience based on your goals</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Acme Corporation"
                  value={data.business.businessName}
                  onChange={(e) => updateBusinessInfo({ businessName: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="website">Business Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={data.business.website}
                  onChange={(e) => updateBusinessInfo({ website: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry / Sector *</Label>
                <Select value={data.business.industry} onValueChange={(value) => updateBusinessInfo({ industry: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="companySize">Company Size *</Label>
                <Select value={data.business.companySize} onValueChange={(value) => updateBusinessInfo({ companySize: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>{size} employees</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="region">Region / Country</Label>
              <Select value={data.business.region} onValueChange={(value) => updateBusinessInfo({ region: value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Upload Section */}
            <div className="pt-4 border-t border-border">
              <Label>Upload Business Documents (Recommended)</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Upload documents to help train your AI chatbot with accurate business information
              </p>

              {/* Recommended Document Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {recommendedDocs.map((doc) => (
                  <span
                    key={doc.key}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5"
                  >
                    {doc.name}
                  </span>
                ))}
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                  dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                )}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-foreground font-medium">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF, DOCX, CSV, TXT (Max 10MB per file)
                </p>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.csv,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      {file.isRecommended && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-1">
                          <Check className="w-3 h-3" /> Recommended
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-background rounded"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="submit" variant="hero" className="flex-1" disabled={!isValid}>
                Save Business Info
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <button
              type="button"
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleSkip}
            >
              Skip for now
            </button>
          </form>
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={() => setStep(2)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
