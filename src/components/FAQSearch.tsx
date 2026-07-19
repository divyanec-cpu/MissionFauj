import { useMemo, useState } from 'react';
import type { Faq } from '../data/faqs';

export function FAQSearch({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [faqs, query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search FAQs — try 'age', 'AFCAT', 'conference'…"
        className="clip-input bg-bg-panel-2 border border-border mb-4 w-full max-w-md px-3.5 py-3 text-[13px] text-ink"
      />
      <div className="flex flex-col">
        {filtered.map((f) => (
          <div key={f.q} className="border-b border-border py-3.5">
            <div className="mb-1 text-sm font-semibold text-khaki">{f.q}</div>
            <div className="text-[13px] leading-relaxed text-muted">{f.a}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-5 text-[13px] text-muted">No FAQs match "{query}". Try a different term.</div>
        )}
      </div>
    </div>
  );
}
