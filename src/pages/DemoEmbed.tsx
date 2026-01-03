import { useState, useRef } from 'react';
import { Play, RotateCcw, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DemoEmbed() {
  const [embedCode, setEmbedCode] = useState('');
  const [isRendered, setIsRendered] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const renderEmbed = () => {
    if (!embedCode.trim() || !previewRef.current) return;

    // Clear previous content
    previewRef.current.innerHTML = '';

    // Create a container for the widget
    const container = document.createElement('div');
    container.innerHTML = embedCode;

    // Execute any script tags
    const scripts = container.querySelectorAll('script');
    scripts.forEach((script) => {
      const newScript = document.createElement('script');
      if (script.src) {
        newScript.src = script.src;
        newScript.async = true;
      } else {
        newScript.textContent = script.textContent;
      }
      document.body.appendChild(newScript);
    });

    // Append non-script content
    previewRef.current.appendChild(container);
    setIsRendered(true);
  };

  const resetPreview = () => {
    if (previewRef.current) {
      previewRef.current.innerHTML = '';
    }
    setEmbedCode('');
    setIsRendered(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Code className="w-6 h-6 text-gray-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Embed Testing Page</h1>
              <p className="text-sm text-gray-500">Paste your chatbot embed code to preview it on a simulated external website</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-gray-900">
              Embed Code Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder={`Paste your embed code here, for example:

<script src="https://atinyqtgnyjeonylydll.supabase.co/functions/v1/widget?token=YOUR_TOKEN"></script>`}
              className="min-h-[150px] font-mono text-sm bg-gray-50 border-gray-200"
            />
            <div className="flex gap-2">
              <Button onClick={renderEmbed} disabled={!embedCode.trim()} className="gap-2">
                <Play className="w-4 h-4" />
                Render Widget
              </Button>
              <Button variant="outline" onClick={resetPreview} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Area */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-medium text-gray-900">
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div 
              ref={previewRef}
              className="min-h-[400px] bg-white relative"
              style={{ isolation: 'isolate' }}
            >
              {!isRendered && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <p className="text-sm">Widget will appear here after you click "Render Widget"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="text-sm text-gray-500 space-y-2">
          <p><strong>How to use:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Go to your chatbot in the Bot Builder and navigate to the "Embed" tab</li>
            <li>Copy the embed code (script tag)</li>
            <li>Paste it in the input field above</li>
            <li>Click "Render Widget" to see your chatbot in action</li>
          </ol>
        </div>
      </div>
    </div>
  );
}