/**
 * Bridge client for CLI ↔ Plugin communication
 *
 * This implements a local HTTP server that the Figma plugin polls.
 * The CLI sends requests via this client, and they're queued for the plugin to pick up.
 *
 * Supports two modes:
 * 1. Server mode: Run with `serve` command - handles plugin polling and request queuing
 * 2. Client mode: Other commands connect to a running server to queue requests
 */

import type { BridgeRequest, BridgeResponse, OperationType, OperationParams } from './types';
import { BRIDGE_CONFIG, generateRequestId } from '@figma-pilot/shared';

interface PendingRequest {
  request: BridgeRequest;
  resolve: (response: BridgeResponse) => void;
  reject: (error: Error) => void;
  timeout: Timer;
}

class BridgeClient {
  private server: ReturnType<typeof Bun.serve> | null = null;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private requestQueue: BridgeRequest[] = [];
  private isRunning = false;
  private isServerMode = false;

  async start(serverMode = false): Promise<void> {
    if (this.isRunning) return;
    this.isServerMode = serverMode;

    this.server = Bun.serve({
      port: BRIDGE_CONFIG.DEFAULT_PORT,
      hostname: BRIDGE_CONFIG.DEFAULT_HOST,
      fetch: (req) => this.handleRequest(req),
    });

    this.isRunning = true;
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.stop();
      this.server = null;
    }
    this.isRunning = false;

    // Reject all pending requests
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Bridge stopped'));
    }
    this.pendingRequests.clear();
    this.requestQueue = [];
  }

  private async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // Plugin polls for requests
    if (url.pathname === '/poll' && req.method === 'GET') {
      const requests = [...this.requestQueue];
      this.requestQueue = [];
      return new Response(JSON.stringify({ requests }), { headers });
    }

    // Plugin sends responses
    if (url.pathname === '/response' && req.method === 'POST') {
      try {
        const response = await req.json() as BridgeResponse;
        this.handleResponse(response);
        return new Response(JSON.stringify({ success: true }), { headers });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid response' }),
          { status: 400, headers }
        );
      }
    }

    // CLI commands queue requests via this endpoint
    if (url.pathname === '/queue' && req.method === 'POST') {
      try {
        const { operation, params, timeout } = await req.json() as {
          operation: OperationType;
          params: OperationParams;
          timeout?: number;
        };

        const result = await this.executeRequest(operation, params, timeout);
        return new Response(JSON.stringify(result), { headers });
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: (error as Error).message }),
          { status: 500, headers }
        );
      }
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          serverMode: this.isServerMode,
          pendingRequests: this.pendingRequests.size,
          queuedRequests: this.requestQueue.length,
        }),
        { headers }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers }
    );
  }

  private handleResponse(response: BridgeResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      console.error(`No pending request for response: ${response.id}`);
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.id);
    pending.resolve(response);
  }

  private async executeRequest<T>(
    operation: OperationType,
    params: OperationParams,
    timeoutMs?: number
  ): Promise<{ success: true; data: T } | { success: false; error: string }> {
    const request: BridgeRequest = {
      id: generateRequestId(),
      operation,
      params,
    };

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        resolve({ success: false, error: `Request timeout: ${operation}` });
      }, timeoutMs || BRIDGE_CONFIG.TIMEOUT_MS);

      this.pendingRequests.set(request.id, {
        request,
        resolve: (response) => {
          if (response.success) {
            resolve({ success: true, data: response.data as T });
          } else {
            resolve({ success: false, error: response.error || 'Unknown error' });
          }
        },
        reject: (err) => resolve({ success: false, error: err.message }),
        timeout,
      });

      this.requestQueue.push(request);
    });
  }

  async send<T>(operation: OperationType, params: OperationParams): Promise<T> {
    // If we're in server mode, execute directly
    if (this.isRunning && this.isServerMode) {
      const result = await this.executeRequest<T>(operation, params);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    }

    // Otherwise, try to connect to a running server
    try {
      const response = await fetch(`http://${BRIDGE_CONFIG.DEFAULT_HOST}:${BRIDGE_CONFIG.DEFAULT_PORT}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, params, timeout: BRIDGE_CONFIG.TIMEOUT_MS }),
      });

      const result = await response.json() as { success: boolean; data?: T; error?: string };

      if (result.success) {
        return result.data as T;
      }
      throw new Error(result.error || 'Unknown error');
    } catch (err) {
      // If no server is running, start our own and try
      if (!this.isRunning) {
        await this.start();
        const result = await this.executeRequest<T>(operation, params);
        await this.stop();
        if (result.success) {
          return result.data;
        }
        throw new Error(result.error);
      }
      throw err;
    }
  }

  isConnected(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
export const bridgeClient = new BridgeClient();

// Convenience function for sending requests
export async function sendRequest<T>(operation: OperationType, params: OperationParams = {}): Promise<T> {
  return bridgeClient.send<T>(operation, params);
}

// Check if a server is already running
export async function checkServerRunning(): Promise<boolean> {
  try {
    const response = await fetch(`http://${BRIDGE_CONFIG.DEFAULT_HOST}:${BRIDGE_CONFIG.DEFAULT_PORT}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Check if plugin is connected by making a status request
export async function checkConnection(): Promise<boolean> {
  try {
    await sendRequest('status', {});
    return true;
  } catch {
    return false;
  }
}
