import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { PillButton } from '../components/ui/PillButton';
import { ExpertCard } from '../components/ExpertCard';
import { EXPERTS, EXPERT_CATEGORIES, CONSULTATION_SLOTS, type Expert, type ExpertCategory } from '../data/experts';

type View = 'list' | 'slot' | 'confirmed';

export function ExpertConsultationPage() {
  const [view, setView] = useState<View>('list');
  const [category, setCategory] = useState<'All' | ExpertCategory>('All');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const filteredExperts = EXPERTS.filter((e) => category === 'All' || e.category === category);

  const bookExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setSelectedSlot(null);
    setView('slot');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        pageLabel="Expert Consultation"
        right={
          view === 'list' ? (
            <div className="flex flex-wrap gap-2">
              {EXPERT_CATEGORIES.map((c) => (
                <PillButton key={c} active={category === c} onClick={() => setCategory(c)} size="sm">
                  {c}
                </PillButton>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setView('list')}
              className="font-heading cursor-pointer border border-border bg-transparent px-4.5 py-2.5 text-[13px] font-semibold tracking-wide text-muted uppercase"
            >
              ← Back to Experts
            </button>
          )
        }
      />
      <div className="px-5 pt-3 sm:px-8 lg:px-14">
        <Link
          to="/ssb-training"
          className="inline-block border border-border px-3 py-1.5 text-xs text-muted no-underline hover:text-ink"
        >
          ← Back to SSB Training
        </Link>
      </div>

      <main className="px-5 pt-5 pb-16 sm:px-8 lg:px-14">
        {view === 'list' && (
          <div className="flex flex-col gap-5.5 animate-rise-in">
            <div className="max-w-xl">
              <div className="text-xs font-semibold tracking-wide text-amber uppercase">1-on-1 · Retired Panel</div>
              <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">
                Book a Consultation
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Direct sessions with retired IOs, GTOs, Psychologists and Board Presidents — feedback grounded in
                real board experience, alongside your self-review practice.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExperts.map((ex) => (
                <ExpertCard key={ex.role} expert={ex} onBook={() => bookExpert(ex)} />
              ))}
            </div>

            <div className="border-t border-border pt-3.5 text-[11px] leading-relaxed text-muted">
              Expert consultation is a deviation from the current MVP scope, flagged and built at explicit request.
            </div>
          </div>
        )}

        {view === 'slot' && selectedExpert && (
          <div className="flex max-w-md flex-col gap-5 animate-rise-in">
            <div>
              <div className="text-xs font-semibold tracking-wide uppercase" style={{ color: selectedExpert.accent }}>
                {selectedExpert.role}
              </div>
              <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">
                {selectedExpert.name}
              </h2>
              <p className="mt-2 text-[13px] text-muted">
                {selectedExpert.credentials} · {selectedExpert.price} / session
              </p>
            </div>
            <div>
              <div className="mb-2.5 text-[11px] tracking-wide text-muted uppercase">Choose a Slot</div>
              <div className="flex flex-wrap gap-2.5">
                {CONSULTATION_SLOTS.map((slot) => (
                  <PillButton key={slot} active={selectedSlot === slot} onClick={() => setSelectedSlot(slot)}>
                    {slot}
                  </PillButton>
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setView('confirmed')}
              className="font-heading self-start cursor-pointer border-none bg-amber px-7 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase disabled:opacity-40"
            >
              Confirm Booking →
            </button>
          </div>
        )}

        {view === 'confirmed' && selectedExpert && (
          <div className="flex max-w-md flex-col gap-4 animate-rise-in">
            <div className="flex h-11 w-11 items-center justify-center bg-eligible">
              <span className="font-heading text-xl font-bold text-[#0f130a]">✓</span>
            </div>
            <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">Session Booked</h2>
            <p className="text-sm leading-relaxed text-muted">
              {selectedExpert.name} — {selectedSlot}. Confirmation and a join link will follow in-app.
            </p>
            <button
              type="button"
              onClick={() => setView('list')}
              className="font-heading self-start cursor-pointer border border-border bg-transparent px-5.5 py-3 text-[13px] font-semibold tracking-wide text-muted uppercase"
            >
              Back to Experts
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
