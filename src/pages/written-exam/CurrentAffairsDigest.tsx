import { useState } from 'react';
import type { DigestPost } from '../../data/digestPosts';
import { useAppState } from '../../context/AppStateContext';
import { digestAssistReply } from '../../lib/aiAssist';
import { AiAssistChat, type AiMessage } from '../../components/ai/AiAssistChat';

interface CurrentAffairsDigestProps {
  posts: DigestPost[];
  horizontal?: boolean;
  unlocked: boolean;
  onOpenPricing: () => void;
}

export function CurrentAffairsDigest({ posts, horizontal, unlocked, onOpenPricing }: CurrentAffairsDigestProps) {
  const { aiUsage, incrementAiUsage } = useAppState();
  const [openPost, setOpenPost] = useState<DigestPost | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);

  const limitReached = !unlocked && aiUsage.digestAssist >= 3;

  const openChat = (post: DigestPost) => {
    setOpenPost(post === openPost ? null : post);
    setMessages([]);
  };

  const ask = (q: string) => {
    setMessages((prev) => [...prev, { q, a: digestAssistReply(q) }]);
    incrementAiUsage('digestAssist');
  };

  return (
    <div>
      <div className="font-heading mb-3 text-sm font-bold tracking-wide uppercase">Current Affairs</div>
      <div className={horizontal ? 'flex gap-3.5 overflow-x-auto pb-1.5' : 'flex flex-col gap-3'}>
        {posts.map((p) => (
          <div
            key={p.title}
            className={horizontal ? 'bg-bg-panel border border-border min-w-[220px] flex-none px-4 py-3.5' : ''}
          >
            <div className="text-[10px] tracking-wide text-amber uppercase">{p.date}</div>
            <div className="mt-0.5 text-[13px] leading-snug">{p.title}</div>
            <button
              type="button"
              onClick={() => openChat(p)}
              className="font-heading mt-1.5 cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold tracking-wide text-amber uppercase"
            >
              {openPost === p ? '← Close' : 'Chat with AI Assist →'}
            </button>
          </div>
        ))}
      </div>

      {openPost && (
        <div className="bg-bg-panel border border-border mt-3.5 p-4">
          <div className="mb-2.5 text-[12px] text-muted">
            Ask about: <span className="text-khaki">{openPost.title}</span>
          </div>
          <AiAssistChat
            messages={messages}
            limitReached={limitReached}
            counterLabel={
              unlocked ? "Unlimited questions — you're subscribed." : `${aiUsage.digestAssist}/3 free questions used in trial mode.`
            }
            placeholder="Ask about this brief or a related topic…"
            onAsk={ask}
            onUnlock={onOpenPricing}
          />
        </div>
      )}
    </div>
  );
}
