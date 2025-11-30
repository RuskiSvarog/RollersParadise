/**
 * SERVER-SENT EVENTS (SSE) SYSTEM
 * 
 * Replaces polling with push-based real-time updates
 * Reduces API calls from 12,000/min to ~100/min (99% reduction!)
 * 
 * Developer: Ruski (avgelatt@gmail.com, 913-213-8666)
 * Date: November 30, 2025
 */

interface SSEClient {
  id: string;
  controller: ReadableStreamDefaultController;
  lastPing: number;
}

/**
 * SSE Broadcaster - Manages real-time event streams
 */
class SSEBroadcaster {
  private clients = new Map<string, Set<SSEClient>>();
  private pingInterval: number | null = null;
  private readonly PING_INTERVAL = 30000; // Ping every 30s to keep connection alive
  private readonly CLIENT_TIMEOUT = 60000; // Remove inactive clients after 60s

  constructor() {
    // Start ping interval to keep connections alive
    this.startPingInterval();
  }

  /**
   * Create SSE stream for a channel
   */
  createStream(channel: string): ReadableStream {
    let clientId: string;

    const stream = new ReadableStream({
      start: (controller) => {
        // Generate unique client ID
        clientId = `${channel}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Add client to channel
        if (!this.clients.has(channel)) {
          this.clients.set(channel, new Set());
        }

        const client: SSEClient = {
          id: clientId,
          controller,
          lastPing: Date.now(),
        };

        this.clients.get(channel)!.add(client);

        console.log(`📡 SSE client connected to ${channel} (ID: ${clientId})`);
        console.log(`📊 Total clients on ${channel}: ${this.clients.get(channel)!.size}`);

        // Send initial connection message
        try {
          const encoder = new TextEncoder();
          const messageData = JSON.stringify({ type: 'connected', channel, clientId });
          const message = `data: ${messageData}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Error sending initial message:', error);
        }
      },

      cancel: () => {
        // Remove client when connection closes
        const channelClients = this.clients.get(channel);
        if (channelClients) {
          for (const client of channelClients) {
            if (client.id === clientId) {
              channelClients.delete(client);
              console.log(`📡 SSE client disconnected from ${channel} (ID: ${clientId})`);
              console.log(`📊 Remaining clients on ${channel}: ${channelClients.size}`);
              break;
            }
          }

          // Clean up empty channels
          if (channelClients.size === 0) {
            this.clients.delete(channel);
            console.log(`📡 Channel ${channel} removed (no clients)`);
          }
        }
      },
    });

    return stream;
  }

  /**
   * Broadcast message to all clients on a channel
   */
  broadcast(channel: string, data: any): void {
    const channelClients = this.clients.get(channel);
    
    if (!channelClients || channelClients.size === 0) {
      // No clients listening on this channel
      return;
    }

    const encoder = new TextEncoder();
    const messageData = JSON.stringify(data);
    const message = `data: ${messageData}\n\n`;
    const encodedMessage = encoder.encode(message);
    const deadClients: SSEClient[] = [];

    // Send to all clients
    for (const client of channelClients) {
      try {
        client.controller.enqueue(encodedMessage);
        client.lastPing = Date.now();
      } catch (error) {
        // Client connection is dead
        console.error(`Failed to send to client ${client.id}:`, error);
        deadClients.push(client);
      }
    }

    // Remove dead clients
    for (const deadClient of deadClients) {
      channelClients.delete(deadClient);
      console.log(`🗑️ Removed dead client ${deadClient.id} from ${channel}`);
    }

    console.log(`📡 Broadcast to ${channel}: ${channelClients.size} clients received update`);
  }

  /**
   * Broadcast to multiple channels
   */
  broadcastMultiple(channels: string[], data: any): void {
    for (const channel of channels) {
      this.broadcast(channel, data);
    }
  }

  /**
   * Get number of clients on a channel
   */
  getClientCount(channel: string): number {
    return this.clients.get(channel)?.size || 0;
  }

  /**
   * Get total number of connected clients across all channels
   */
  getTotalClients(): number {
    let total = 0;
    for (const clients of this.clients.values()) {
      total += clients.size;
    }
    return total;
  }

  /**
   * Get statistics about all channels
   */
  getStats() {
    const stats: Record<string, number> = {};
    for (const [channel, clients] of this.clients.entries()) {
      stats[channel] = clients.size;
    }
    return {
      totalClients: this.getTotalClients(),
      channels: stats,
    };
  }

  /**
   * Send periodic pings to keep connections alive
   */
  private startPingInterval(): void {
    if (this.pingInterval !== null) {
      return;
    }

    this.pingInterval = setInterval(() => {
      const now = Date.now();
      const encoder = new TextEncoder();
      const pingMessage = encoder.encode(`: ping\n\n`);

      for (const [channel, clients] of this.clients.entries()) {
        const deadClients: SSEClient[] = [];

        for (const client of clients) {
          // Check if client has timed out
          if (now - client.lastPing > this.CLIENT_TIMEOUT) {
            deadClients.push(client);
            continue;
          }

          // Send ping
          try {
            client.controller.enqueue(pingMessage);
            client.lastPing = now;
          } catch (error) {
            // Connection is dead
            deadClients.push(client);
          }
        }

        // Remove dead clients
        for (const deadClient of deadClients) {
          clients.delete(deadClient);
          console.log(`🗑️ Removed inactive client ${deadClient.id} from ${channel}`);
        }

        // Clean up empty channels
        if (clients.size === 0) {
          this.clients.delete(channel);
          console.log(`🗑️ Removed empty channel ${channel}`);
        }
      }
    }, this.PING_INTERVAL) as any;
  }

  /**
   * Stop ping interval (cleanup)
   */
  destroy(): void {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Global SSE broadcaster instance
export const sse = new SSEBroadcaster();

/**
 * Standard SSE channels
 */
export const SSE_CHANNELS = {
  ROOMS: 'rooms',
  STATS: 'stats',
  LEADERBOARD: 'leaderboard',
  STREAKS: 'streaks',
  NOTIFICATIONS: 'notifications',
} as const;

/**
 * Helper to create SSE response
 */
export function createSSEResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
      'Access-Control-Allow-Origin': '*', // CORS for SSE
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * Broadcast room updates to all listening clients
 */
export function broadcastRoomUpdate(rooms: any[]): void {
  sse.broadcast(SSE_CHANNELS.ROOMS, {
    type: 'rooms',
    data: rooms,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast stats update
 */
export function broadcastStatsUpdate(stats: any): void {
  sse.broadcast(SSE_CHANNELS.STATS, {
    type: 'stats',
    data: stats,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast leaderboard update
 */
export function broadcastLeaderboardUpdate(leaderboard: any): void {
  sse.broadcast(SSE_CHANNELS.LEADERBOARD, {
    type: 'leaderboard',
    data: leaderboard,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast hot streaks update
 */
export function broadcastStreaksUpdate(streaks: any): void {
  sse.broadcast(SSE_CHANNELS.STREAKS, {
    type: 'streaks',
    data: streaks,
    timestamp: Date.now(),
  });
}

/**
 * Get SSE connection statistics
 */
export function getSSEStats() {
  return sse.getStats();
}