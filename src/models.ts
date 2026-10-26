import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';

/**
 * Model tiers. Ids use OpenRouter / AI Gateway naming ("vendor/model"). Override per environment:
 *   MODEL_GATE    the gate: runs on every batch, so cheap and fast
 *   MODEL_WORKER  WORKER_MODE=model: decides what to do about a subject (no tools)
 *   MODEL_CHAT    the chat agent: tools and a loop, so a capable model
 */
export const MODEL_TIERS = {
  gate: process.env.MODEL_GATE ?? 'anthropic/claude-haiku-4.5',
  worker: process.env.MODEL_WORKER ?? 'anthropic/claude-sonnet-5',
  chat: process.env.MODEL_CHAT ?? 'anthropic/claude-sonnet-5',
} as const;

let openrouter: ReturnType<typeof createOpenRouter> | undefined;

/** True when either provider is configured, so model calls can run. */
export function modelsAvailable(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY || process.env.AI_GATEWAY_API_KEY);
}

/**
 * Resolves a model id to a provider model. With OPENROUTER_API_KEY set, calls go straight to
 * OpenRouter; otherwise the id is returned as a string and routed through Vercel AI Gateway.
 */
export function languageModel(id: string): LanguageModel {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return id;
  openrouter ??= createOpenRouter({ apiKey, headers: { 'X-Title': 'Ambient agent workshop' } });
  return openrouter.chat(id);
}

export function modelProviderName(): 'openrouter' | 'gateway' {
  return process.env.OPENROUTER_API_KEY ? 'openrouter' : 'gateway';
}
