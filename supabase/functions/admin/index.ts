import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid plan tiers
const VALID_PLANS = ['Free', 'Pro', 'Business', 'Enterprise'];
const MAX_CREDITS = 1000000;
const MIN_CREDITS = 0;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
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

    // Check if user has admin role
    const { data: isAdmin, error: roleError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !isAdmin) {
      console.log('Admin check failed for user:', user.id, roleError);
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    console.log(`Admin action: ${action} by user: ${user.id}`);

    switch (action) {
      case 'list-users': {
        // Fetch all profiles with user roles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get user roles for all users
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');

        // Get document counts and storage usage per user
        const { data: docStats, error: docError } = await supabase
          .from('documents')
          .select('user_id, file_size');

        // Calculate storage per user
        const storageByUser: Record<string, number> = {};
        const docCountByUser: Record<string, number> = {};
        
        if (docStats) {
          docStats.forEach(doc => {
            storageByUser[doc.user_id] = (storageByUser[doc.user_id] || 0) + (doc.file_size || 0);
            docCountByUser[doc.user_id] = (docCountByUser[doc.user_id] || 0) + 1;
          });
        }

        // Get chatbot counts per user
        const { data: botStats } = await supabase
          .from('chatbots')
          .select('user_id');

        const botCountByUser: Record<string, number> = {};
        if (botStats) {
          botStats.forEach(bot => {
            botCountByUser[bot.user_id] = (botCountByUser[bot.user_id] || 0) + 1;
          });
        }

        // Map roles to users
        const rolesByUser: Record<string, string[]> = {};
        if (roles) {
          roles.forEach(r => {
            if (!rolesByUser[r.user_id]) rolesByUser[r.user_id] = [];
            rolesByUser[r.user_id].push(r.role);
          });
        }

        // Combine data
        const users = profiles?.map(profile => ({
          ...profile,
          roles: rolesByUser[profile.user_id] || ['user'],
          storage_used: storageByUser[profile.user_id] || 0,
          document_count: docCountByUser[profile.user_id] || 0,
          chatbot_count: botCountByUser[profile.user_id] || 0,
        }));

        return new Response(JSON.stringify({ users }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update-credits': {
        const { userId, newCredits } = await req.json();

        // Validate userId
        if (!userId || typeof userId !== 'string') {
          return new Response(JSON.stringify({ error: 'Valid User ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Validate credits is a number
        if (typeof newCredits !== 'number') {
          return new Response(JSON.stringify({ error: 'Credits must be a number' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Validate credits is an integer
        if (!Number.isInteger(newCredits)) {
          return new Response(JSON.stringify({ error: 'Credits must be a whole number' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Validate credits range
        if (newCredits < MIN_CREDITS || newCredits > MAX_CREDITS) {
          return new Response(JSON.stringify({ 
            error: `Credits must be between ${MIN_CREDITS} and ${MAX_CREDITS.toLocaleString()}` 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get previous balance for audit log
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits_balance')
          .eq('user_id', userId)
          .single();

        const previousCredits = profile?.credits_balance ?? 0;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits_balance: newCredits })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating credits:', updateError);
          return new Response(JSON.stringify({ error: 'Failed to update credits' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Audit log
        console.log(`Admin ${user.id} changed credits for user ${userId} from ${previousCredits} to ${newCredits}`);

        return new Response(JSON.stringify({ 
          success: true, 
          userId, 
          newCredits,
          previousCredits
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update-plan': {
        const { userId, newPlan } = await req.json();

        // Validate userId
        if (!userId || typeof userId !== 'string') {
          return new Response(JSON.stringify({ error: 'Valid User ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Validate plan
        if (!newPlan || typeof newPlan !== 'string') {
          return new Response(JSON.stringify({ error: 'Valid plan required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Validate plan is in allowed list
        if (!VALID_PLANS.includes(newPlan)) {
          return new Response(JSON.stringify({ 
            error: `Plan must be one of: ${VALID_PLANS.join(', ')}` 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ plan_tier: newPlan })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating plan:', updateError);
          return new Response(JSON.stringify({ error: 'Failed to update plan' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`Admin ${user.id} updated plan for user ${userId} to ${newPlan}`);

        return new Response(JSON.stringify({ success: true, userId, newPlan }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'check-admin': {
        // Simple check if current user is admin (already verified above)
        return new Response(JSON.stringify({ isAdmin: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in admin function:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
