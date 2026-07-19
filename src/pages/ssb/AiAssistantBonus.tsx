import { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { ssbAssistantReply } from '../../lib/aiAssist';
import { AiAssistChat, type AiMessage } from '../../components/ai/AiAssistChat';

export function AiAssistantBonus({ onUnlock }: { onUnlock: () => void }) {
  const { aiUsage, ssbSubscription, incrementAiUsage } = useAppState();
  const [messages, setMessages] = useState<AiMessage[]>([]);

  const subscribed = ssbSubscription === 'subscribed';
  const limitReached = !subscribed && aiUsage.ssbAssistant >= 3;

  const ask = (q: string) => {
    setMessages((prev) => [...prev, { q, a: ssbAssistantReply(q) }]);
    incrementAiUsage('ssbAssistant');
  };

  return (
    <div className="flex max-w-lg flex-col gap-4.5 pt-2 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">Free Bonus</div>
        <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">AI Assistant</h2>
        <p className="mt-1.5 text-[13px] text-muted">
          Explains OLQs, rubrics and response structure. Never scores your answers.
        </p>
      </div>
      <AiAssistChat
        messages={messages}
        limitReached={limitReached}
        counterLabel={subscribed ? "Unlimited questions — you're subscribed." : `${aiUsage.ssbAssistant}/3 free questions used in trial mode.`}
        placeholder="Ask about an OLQ, rubric or response structure…"
        onAsk={ask}
        onUnlock={onUnlock}
      />
    </div>
  );
}
