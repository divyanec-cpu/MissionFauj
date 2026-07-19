import { Link } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { FAQSearch } from '../components/FAQSearch';
import { ELIGIBILITY_ROWS, SSB_DAYS } from '../data/helpCenterContent';
import { FAQS } from '../data/faqs';

export function HelpCenterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        pageLabel="Help Centre"
        right={
          <div className="flex flex-wrap gap-2">
            <Link to="/" className="border border-border px-2.5 py-1 text-[11px] text-muted no-underline hover:text-ink">
              Eligibility
            </Link>
            <Link
              to="/written-exam-prep"
              className="border border-border px-2.5 py-1 text-[11px] text-muted no-underline hover:text-ink"
            >
              Written Prep
            </Link>
            <Link
              to="/ssb-training"
              className="border border-border px-2.5 py-1 text-[11px] text-muted no-underline hover:text-ink"
            >
              SSB Training
            </Link>
          </div>
        }
      />

      <main className="flex max-w-4xl flex-col gap-10 px-5 pt-6 pb-16 sm:px-8 sm:pt-10 lg:px-14">
        <div>
          <h1 className="font-heading mb-1.5 text-3xl font-bold tracking-wide uppercase sm:text-4xl">
            Eligibility, Process &amp; FAQs
          </h1>
          <p className="text-sm text-muted">
            Everything about who qualifies for what, how SSB actually runs, and answers to what candidates ask most.
          </p>
        </div>

        <div>
          <div className="font-heading mb-3.5 text-sm font-bold tracking-wide text-amber uppercase">
            Eligibility &amp; Qualification
          </div>
          <div className="overflow-x-auto">
            <div className="flex min-w-[720px] flex-col">
              <div className="grid grid-cols-[1.4fr_1fr_1.6fr_0.9fr] gap-2.5 border-b border-border px-3 py-2.5 text-[11px] tracking-wide text-muted uppercase">
                <div>Scheme</div>
                <div>Age</div>
                <div>Education</div>
                <div>Marital Status</div>
              </div>
              {ELIGIBILITY_ROWS.map((r) => (
                <div key={r.name} className="grid grid-cols-[1.4fr_1fr_1.6fr_0.9fr] gap-2.5 border-b border-border px-3 py-3 text-[13px]">
                  <div className="font-semibold text-khaki">{r.name}</div>
                  <div className="text-muted">{r.age}</div>
                  <div>{r.education}</div>
                  <div className="text-muted">{r.marital}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2.5 text-[11px] text-muted">
            Illustrative reference. Production figures come from admin-editable scheme tables per the current
            official notification.
          </div>
        </div>

        <div>
          <div className="font-heading mb-3.5 text-sm font-bold tracking-wide text-amber uppercase">
            The SSB Process, Day by Day
          </div>
          <div className="flex flex-col">
            {SSB_DAYS.map((d) => (
              <div key={d.day} className="flex gap-4 border-b border-border py-3.5">
                <div className="font-heading min-w-20 flex-none text-[13px] font-bold tracking-wide text-amber uppercase">
                  {d.day}
                </div>
                <div>
                  <div className="mb-0.5 text-sm font-semibold">{d.title}</div>
                  <div className="text-[13px] leading-relaxed text-muted">{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-heading mb-3.5 text-sm font-bold tracking-wide text-amber uppercase">
            Frequently Asked Questions
          </div>
          <FAQSearch faqs={FAQS} />
        </div>
      </main>
    </div>
  );
}
