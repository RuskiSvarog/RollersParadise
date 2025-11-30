import { projectId, publicAnonKey } from './info';

// Mock channel for local development and testing
// In production, this would be replaced with real Supabase Realtime
// For now, channels work within the same browser session only
class MockChannel {
  private channelName: string;
  private callbacks: Map<string, Function[]> = new Map();

  constructor(channelName: string) {
    this.channelName = channelName;
  }

  on(type: string, filter: any, callback: Function) {
    const key = `${type}:${filter.event || 'default'}`;
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, []);
    }
    this.callbacks.get(key)?.push(callback);
    return this;
  }

  send(message: any) {
    // Simulate local broadcast by calling callbacks immediately
    const key = `${message.type}:${message.event}`;
    const callbacks = this.callbacks.get(key) || [];
    callbacks.forEach(cb => {
      // Simulate async broadcast with small delay
      setTimeout(() => cb({ payload: message.payload }), 10);
    });
    return Promise.resolve({ error: null });
  }

  subscribe() {
    // Mock subscribe - just return self for chaining
    return this;
  }

  unsubscribe() {
    this.callbacks.clear();
    return Promise.resolve({ error: null });
  }
}

// Simple fetch-based Supabase client for frontend
class SupabaseClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private channels: Map<string, MockChannel> = new Map();

  constructor(url: string, anonKey: string) {
    this.baseUrl = url;
    this.headers = {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    };
  }

  async fetch(path: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });
    return response.json();
  }

  channel(channelName: string, options?: any) {
    // Return existing channel or create new one
    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, new MockChannel(channelName));
    }
    return this.channels.get(channelName)!;
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = new SupabaseClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey
    );
  }
  return supabaseInstance;
}
