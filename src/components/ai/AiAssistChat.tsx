import { useState } from 'react';

export interface AiMessage {
  q: string;
  a: string;
}

interface AiAssistChatProps {
  messages: AiMessage[];
  limitReached: boolean;
  counterLabel: string;
  placeholder?: string;
  onAsk: (question: string) => Promise<void>;
  onUnlock: () => void;
}

export function AiAssistChat({
  messages,
  limitReached,
  counterLabel,
  placeholder = 'Ask a question…',
  onAsk,
  onUnlock,
}: AiAssistChatProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setError(null);
    setLoading(true);
    try {
      await onAsk(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-[80px] flex-col gap-2.5">
        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="bg-bg-panel-2 border border-border max-w-[85%] self-end px-3.5 py-2.5 text-[13px]">
              {msg.q}
            </div>
            <div className="bg-bg-panel border border-border border-l-4 border-l-amber max-w-[85%] self-start px-3.5 py-2.5 text-[13px] text-khaki">
              {msg.a}
            </div>
          </div>
        ))}
        {loading && (
          <div className="bg-bg-panel border border-border border-l-4 border-l-amber max-w-[85%] self-start px-3.5 py-2.5 text-[13px] text-muted">
            Thinking…
          </div>
        )}
      </div>

      {error && <div className="text-[12px] text-not-eligible">{error}</div>}

      {limitReached ? (
        <div className="bg-bg-panel border border-amber flex flex-col gap-2.5 p-4">
          <div className="text-[13px] text-khaki">
            You've used your free questions in trial mode. Subscribe for unlimited AI Assistant access.
          </div>
          <button
            type="button"
            onClick={onUnlock}
            className="font-heading self-start cursor-pointer border-none bg-amber px-4 py-2.5 text-xs font-bold tracking-wide text-[#1b1500] uppercase"
          >
            Unlock Unlimited →
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={placeholder}
              disabled={loading}
              className="bg-bg-panel-2 border border-border flex-1 px-3.5 py-3 text-[13px] text-ink disabled:opacity-60"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading}
              className="font-heading cursor-pointer border-none bg-amber px-5 py-3 text-xs font-bold tracking-wide text-[#1b1500] uppercase disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Asking…' : 'Ask'}
            </button>
          </div>
          <div className="text-[11px] text-muted">{counterLabel}</div>
        </>
      )}
    </div>
  );
}
