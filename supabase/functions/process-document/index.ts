import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { documentId, filePath, fileType } = await req.json();

    if (!documentId || !filePath) {
      return new Response(JSON.stringify({ error: 'Document ID and file path required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing document: ${documentId}, file: ${filePath}, type: ${fileType}`);

    // Update document status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId)
      .eq('user_id', user.id);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('documents')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      await supabase
        .from('documents')
        .update({ status: 'failed', error_message: 'Failed to download file' })
        .eq('id', documentId);
      
      return new Response(JSON.stringify({ error: 'Failed to download file' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let extractedText = '';

    try {
      const normalizedType = fileType?.toLowerCase() || '';
      
      if (normalizedType.includes('text') || normalizedType === 'txt' || filePath.endsWith('.txt')) {
        // Plain text file
        extractedText = await fileData.text();
      } else if (normalizedType.includes('pdf') || filePath.endsWith('.pdf')) {
        // PDF file - extract text using a simple approach
        // For PDFs, we'll extract what text we can from the raw bytes
        const arrayBuffer = await fileData.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        
        // Try to extract readable text from PDF
        const textMatches = text.match(/\(([^)]+)\)/g);
        if (textMatches) {
          extractedText = textMatches
            .map(match => match.slice(1, -1))
            .filter(str => str.length > 2 && /[a-zA-Z]/.test(str))
            .join(' ');
        }
        
        // Also try to find text between stream markers
        const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
        let streamMatch;
        while ((streamMatch = streamRegex.exec(text)) !== null) {
          const streamContent = streamMatch[1];
          // Try to decode if it looks like text
          if (/[a-zA-Z]{3,}/.test(streamContent)) {
            extractedText += ' ' + streamContent.replace(/[^\x20-\x7E\s]/g, ' ');
          }
        }

        // Clean up the extracted text
        extractedText = extractedText
          .replace(/\s+/g, ' ')
          .replace(/[^\x20-\x7E\s]/g, '')
          .trim();

        if (!extractedText || extractedText.length < 50) {
          extractedText = '[PDF content - text extraction limited. Consider uploading a text version of this document for better results.]';
        }
      } else if (normalizedType.includes('csv') || filePath.endsWith('.csv')) {
        // CSV file
        extractedText = await fileData.text();
      } else if (normalizedType.includes('json') || filePath.endsWith('.json')) {
        // JSON file
        const jsonText = await fileData.text();
        try {
          const parsed = JSON.parse(jsonText);
          extractedText = JSON.stringify(parsed, null, 2);
        } catch {
          extractedText = jsonText;
        }
      } else if (normalizedType.includes('markdown') || filePath.endsWith('.md')) {
        // Markdown file
        extractedText = await fileData.text();
      } else {
        // Try to read as text for other file types
        try {
          extractedText = await fileData.text();
        } catch {
          extractedText = '[Unable to extract text from this file type]';
        }
      }

      // Limit text length to prevent database issues
      const maxLength = 100000; // 100KB of text
      if (extractedText.length > maxLength) {
        extractedText = extractedText.substring(0, maxLength) + '\n\n[Content truncated due to length...]';
      }

      console.log(`Extracted ${extractedText.length} characters from document ${documentId}`);

      // Update document with extracted text
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          status: 'processed', 
          extracted_text: extractedText,
          error_message: null
        })
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      return new Response(JSON.stringify({ 
        success: true, 
        documentId,
        extractedLength: extractedText.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (extractError) {
      console.error('Extraction error:', extractError);
      
      await supabase
        .from('documents')
        .update({ 
          status: 'failed', 
          error_message: extractError instanceof Error ? extractError.message : 'Failed to extract text'
        })
        .eq('id', documentId);

      return new Response(JSON.stringify({ 
        error: 'Failed to extract text from document',
        details: extractError instanceof Error ? extractError.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in process-document function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
