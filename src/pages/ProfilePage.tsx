import { Link, useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { ClipPanel } from '../components/ui/ClipPanel';
import { Badge } from '../components/ui/Badge';
import { useAppState } from '../context/AppStateContext';
import type { SubscriptionState, WrittenExam } from '../types/subscription';

function maskPhone(phone: string) {
  return phone ? 'XXXXX' + phone.slice(-4) : '';
}

function subscriptionBadge(state: SubscriptionState) {
  if (state === 'subscribed') return <Badge label="Subscribed" tone="eligible" />;
  if (state === 'trial') return <Badge label="Trial Active" tone="amber" />;
  return <Badge label="Not Started" tone="steel" />;
}

const WRITTEN_EXAMS: WrittenExam[] = ['NDA', 'CDS', 'AFCAT'];

export function ProfilePage() {
  const appState = useAppState();
  const navigate = useNavigate();
  const auth = appState.auth;

  const handleSignOut = () => {
    appState.signOut();
    navigate('/');
  };

  if (!auth) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader pageLabel="Profile" />

      <main className="flex max-w-2xl flex-col gap-8 px-5 pt-6 pb-16 sm:px-8 sm:pt-10 lg:px-14">
        <div>
          <h1 className="font-heading mb-1.5 text-3xl font-bold tracking-wide uppercase sm:text-4xl">Your Account</h1>
          <p className="text-sm text-muted">Account details, subscriptions, and sign-out — in one place.</p>
        </div>

        <section>
          <div className="font-heading mb-3.5 text-sm font-bold tracking-wide text-amber uppercase">Account</div>
          <ClipPanel accent="amber">
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Mobile Number</span>
                <span className="font-heading font-semibold text-ink">+91 {maskPhone(auth.candidatePhone)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Age</span>
                <span className="font-heading font-semibold text-ink">{auth.age} years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Status</span>
                <Badge label={auth.isMinor ? 'Minor · Guardian-Consented' : 'Adult · Self-Consented'} tone="eligible" />
              </div>
              {auth.isMinor && auth.guardianName && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">Guardian</span>
                  <span className="text-ink">
                    {auth.guardianName}
                    {auth.guardianPhone && ` · +91 ${maskPhone(auth.guardianPhone)}`}
                  </span>
                </div>
              )}
            </div>
          </ClipPanel>
        </section>

        <section>
          <div className="font-heading mb-3.5 text-sm font-bold tracking-wide text-amber uppercase">
            Subscriptions
          </div>
          <div className="flex flex-col gap-3">
            {WRITTEN_EXAMS.map((exam) => (
              <ClipPanel key={exam} accent="steel">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-heading font-semibold text-ink">{exam} Written Prep</div>
                    {appState.writtenSubscriptions[exam] === 'none' && (
                      <Link to="/written-exam-prep" className="text-[12px] text-amber no-underline">
                        Start 7-day free trial →
                      </Link>
                    )}
                  </div>
                  {subscriptionBadge(appState.writtenSubscriptions[exam])}
                </div>
              </ClipPanel>
            ))}
            <ClipPanel accent="steel">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-heading font-semibold text-ink">SSB Training</div>
                  {appState.ssbSubscription === 'none' && (
                    <Link to="/ssb-training" className="text-[12px] text-amber no-underline">
                      Start 7-day free trial →
                    </Link>
                  )}
                  {appState.isExistingMember && appState.ssbSubscription === 'none' && (
                    <div className="text-[12px] text-eligible">20% member discount applies at enrollment</div>
                  )}
                </div>
                {subscriptionBadge(appState.ssbSubscription)}
              </div>
            </ClipPanel>
          </div>
        </section>

        <section>
          <ClipPanel accent="not-eligible">
            <div className="flex flex-col gap-2.5">
              <div className="font-heading font-semibold text-ink">Sign Out</div>
              <p className="text-[12px] text-muted">
                Logs you out of this device. Your profile, eligibility report, and subscriptions are kept — signing
                back in with the same mobile number picks up right where you left off.
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="font-heading clip-button self-start cursor-pointer border-none bg-not-eligible px-6 py-2.5 text-xs font-bold tracking-wide text-ink uppercase"
              >
                Sign Out
              </button>
            </div>
          </ClipPanel>
        </section>
      </main>
    </div>
  );
}
