import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { askAi } from '../../lib/aiApi';
import { AiAssistChat, type AiMessage } from './AiAssistChat';

const FREE_QUESTIONS = 3;

/**
 * The assistant reachable from every authenticated page.
 *
 * It deliberately does not render before setup is finished: during login and
 * onboarding a candidate has no context for it, and it would sit on top of a
 * flow whose whole job is getting them through it. `App` mounts this once
 * rather than each page doing so, so the conversation survives navigation —
 * asking a question, moving to another page, and asking a follow-up keeps the
 * thread rather than silently starting a new one.
 *
 * Same 3-free-then-subscribe treatment as the other two AI surfaces, on its
 * own counter. Note that cap is a client-side courtesy, not enforcement: the
 * backend rate limits per IP and globally, but cannot yet attribute a call to
 * a candidate (see Technical Brief §7).
 */
export function FloatingAiAssistant() {
  const appState = useAppState();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);

  const signedIn = Boolean(appState.auth && appState.candidateName);

  // Escape closes it, matching the expectation set by every other overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!signedIn) return null;

  const unlocked =
    appState.ssbSubscription !== 'none' || Object.values(appState.writtenSubscriptions).some((s) => s !== 'none');
  const used = appState.aiUsage.general;
  const limitReached = !unlocked && used >= FREE_QUESTIONS;

  const ask = async (q: string) => {
    const { answer, aiUsage } = await askAi('general', q, appState.auth?.sessionToken);
    setMessages((prev) => [...prev, { q, a: answer }]);
    if (aiUsage) appState.applyServerAiUsage(aiUsage);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
          className="font-heading clip-button fixed right-4 bottom-4 z-40 cursor-pointer border-none bg-amber px-5 py-3.5 text-xs font-bold tracking-wide text-[#1b1500] uppercase sm:right-6 sm:bottom-6"
        >
          Ask AI
        </button>
      )}

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-end px-3 pb-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:px-0 sm:pb-0">
          <div className="bg-bg-panel border border-border clip-panel flex w-full max-w-[420px] flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-heading text-sm font-bold tracking-wide uppercase">MissionFauj Assistant</div>
                <div className="text-[11px] text-muted">Exams, SSB, schemes and the app itself.</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI assistant"
                className="font-heading cursor-pointer border border-border bg-transparent px-2.5 py-1 text-[11px] font-semibold tracking-wide text-muted uppercase"
              >
                Close
              </button>
            </div>

            {/* Capped so a long thread scrolls inside the panel rather than
                pushing it off a phone screen. */}
            <div className="max-h-[45vh] overflow-y-auto">
              <AiAssistChat
                messages={messages}
                limitReached={limitReached}
                counterLabel={
                  unlocked
                    ? "Unlimited questions — you're subscribed."
                    : `${used}/${FREE_QUESTIONS} free questions used in trial mode.`
                }
                placeholder="Ask about exams, SSB or eligibility…"
                onAsk={ask}
                onUnlock={() => {
                  setOpen(false);
                  navigate('/ssb-training');
                }}
              />
            </div>

            <div className="border-t border-border pt-2 text-[10px] leading-relaxed text-muted">
              Explains and coaches only — it will never score your SSB responses or tell you whether you personally
              qualify for a scheme.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
