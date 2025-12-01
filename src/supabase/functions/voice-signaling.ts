// Voice Chat Signaling Server for Rollers Paradise
// Handles WebRTC signaling for peer-to-peer voice connections
// Supports global servers with proper security and privacy

import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceSignal {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-start' | 'call-end';
  from: string;
  to: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  timestamp: number;
}

interface ActiveCall {
  participants: string[];
  startTime: number;
  signals: VoiceSignal[];
}

// In-memory storage for active calls and pending signals
// In production, this would use Redis or similar for scalability
const activeCalls = new Map<string, ActiveCall>();
const pendingSignals = new Map<string, VoiceSignal[]>();

// Maximum signal age (5 minutes)
const MAX_SIGNAL_AGE = 5 * 60 * 1000;

// Cleanup old signals periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, signals] of pendingSignals.entries()) {
    const validSignals = signals.filter(s => now - s.timestamp < MAX_SIGNAL_AGE);
    if (validSignals.length === 0) {
      pendingSignals.delete(key);
    } else {
      pendingSignals.set(key, validSignals);
    }
  }
}, 60000); // Run every minute

function getCallKey(user1: string, user2: string): string {
  return [user1, user2].sort().join(':');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle voice signal posting
    if (path.endsWith('/voice/signal') && req.method === 'POST') {
      const body = await req.json();
      const signal: VoiceSignal = {
        type: body.type,
        from: body.from,
        to: body.to,
        offer: body.offer,
        answer: body.answer,
        candidate: body.candidate,
        timestamp: Date.now(),
      };

      // Verify the sender is authenticated user
      if (signal.from !== user.email) {
        return new Response(JSON.stringify({ error: 'Unauthorized sender' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify both users are friends
      const { data: friendCheck } = await supabaseClient
        .from('friends')
        .select('*')
        .or(`and(user1.eq.${signal.from},user2.eq.${signal.to}),and(user1.eq.${signal.to},user2.eq.${signal.from})`)
        .single();

      if (!friendCheck) {
        return new Response(JSON.stringify({ error: 'Users are not friends' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Store signal for recipient
      const recipientSignals = pendingSignals.get(signal.to) || [];
      recipientSignals.push(signal);
      pendingSignals.set(signal.to, recipientSignals);

      // Log the signal for security audit
      await supabaseClient.from('voice_logs').insert({
        from_email: signal.from,
        to_email: signal.to,
        signal_type: signal.type,
        timestamp: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle fetching pending signals
    if (path.endsWith('/voice/signals') && req.method === 'GET') {
      const email = url.searchParams.get('email');

      if (!email || email !== user.email) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const signals = pendingSignals.get(email) || [];
      
      // Clear retrieved signals
      pendingSignals.delete(email);

      return new Response(JSON.stringify(signals), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle call start notification
    if (path.endsWith('/voice/start') && req.method === 'POST') {
      const body = await req.json();
      const { from, to, timestamp } = body;

      if (from !== user.email) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const callKey = getCallKey(from, to);
      activeCalls.set(callKey, {
        participants: [from, to],
        startTime: timestamp,
        signals: [],
      });

      // Log call start
      await supabaseClient.from('voice_logs').insert({
        from_email: from,
        to_email: to,
        signal_type: 'call-start',
        timestamp: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle call end notification
    if (path.endsWith('/voice/end') && req.method === 'POST') {
      const body = await req.json();
      const { from, to, timestamp } = body;

      if (from !== user.email) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const callKey = getCallKey(from, to);
      const call = activeCalls.get(callKey);
      
      if (call) {
        const duration = timestamp - call.startTime;
        activeCalls.delete(callKey);

        // Log call end with duration
        await supabaseClient.from('voice_logs').insert({
          from_email: from,
          to_email: to,
          signal_type: 'call-end',
          timestamp: new Date().toISOString(),
          duration_ms: duration,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Voice signaling error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
