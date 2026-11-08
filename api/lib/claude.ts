import Anthropic from '@anthropic-ai/sdk';

const TIMEOUT_MS = 30_000;
const MAX_TOKENS = 4_000;

let client: Anthropic | null = null;

export interface AskClaudeInput {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

/** The only code that calls the Anthropic API. Throws on any failure, a timeout or a refusal. */
export async function askClaude(input: AskClaudeInput): Promise<string> {
  client ??= new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 0 });
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-5-5',
    max_tokens: MAX_TOKENS,
    system: input.system,
    messages: input.messages,
  });
  // This SDK version's types predate the 'refusal' stop reason, so compare it as a plain string.
  if ((response.stop_reason as string) === 'refusal') throw new Error('The model declined to answer');
  const text = response.content.flatMap((block) => (block.type === 'text' ? [block.text] : [])).join('');
  if (!text.trim()) throw new Error('The model returned no text');
  return text;
}
