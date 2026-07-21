import { useRef, useState } from 'react';
import { useAppState } from '../../../context/AppStateContext';
import { checkDob, isValidIndianMobile, isValidName } from '../../../lib/validation';
import { sendOtp, verifyOtp, resendOtp } from '../../../lib/otpApi';

type Phase = 'dob' | 'candidate-form' | 'parent-form' | 'otp' | 'invite-sent' | 'welcome';
type PendingRole = 'candidate' | 'parent' | null;

const inputClass = 'bg-bg-panel-2 border border-border w-full px-3.5 py-3 text-sm text-ink';
const labelClass = 'mb-1.5 block text-[11px] tracking-wide text-muted uppercase';
const errorClass = 'mt-1.5 text-[12px] text-not-eligible';

function digitsOnly(value: string, maxLen: number) {
  return value.replace(/\D/g, '').slice(0, maxLen);
}

function MobileField({
  label,
  value,
  onChange,
  touched,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  touched: boolean;
}) {
  const showError = touched && value.length > 0 && !isValidIndianMobile(value);
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex">
        <div className="bg-bg-panel-2 border border-border border-r-0 flex items-center px-3.5 text-sm text-muted">
          +91
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(digitsOnly(e.target.value, 10))}
          placeholder="10-digit mobile number"
          className="bg-bg-panel-2 border border-border w-full px-3.5 py-3 text-sm text-ink"
        />
      </div>
      {showError && <div className={errorClass}>Enter a valid 10-digit Indian mobile number (starts 6-9).</div>}
    </div>
  );
}

export function RegisterStep({ onComplete }: { onComplete: (age: number) => void }) {
  const appState = useAppState();
  const [dob, setDob] = useState('');
  const [dobTouched, setDobTouched] = useState(false);
  const [phase, setPhase] = useState<Phase>('dob');
  const [age, setAge] = useState(0);
  const [inviteCode, setInviteCode] = useState('');
  const [welcomeName, setWelcomeName] = useState('');

  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidateTouched, setCandidateTouched] = useState(false);

  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [childName, setChildName] = useState('');
  const [parentTouched, setParentTouched] = useState(false);

  const [pendingRole, setPendingRole] = useState<PendingRole>(null);
  const [otpTarget, setOtpTarget] = useState('');
  const [reqId, setReqId] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [sendError, setSendError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const verifyingRef = useRef(false);
  const sendingRef = useRef(false);

  const dobCheck = checkDob(dob);
  const todayStr = new Date().toISOString().slice(0, 10);

  const confirmDob = () => {
    setDobTouched(true);
    if (!dobCheck.valid || dobCheck.age === undefined) return;
    setAge(dobCheck.age);
    setPhase(dobCheck.age >= 18 ? 'candidate-form' : 'parent-form');
  };

  const candidateValid =
    isValidName(candidateName) && /^\S+@\S+\.\S+$/.test(candidateEmail) && isValidIndianMobile(candidatePhone);

  const requestOtp = async (role: PendingRole, phone: string) => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSendingOtp(true);
    setSendError('');
    const result = await sendOtp(phone);
    sendingRef.current = false;
    setSendingOtp(false);
    if (!result.ok || !result.reqId) {
      setSendError(result.error ?? 'Could not send the verification code.');
      return;
    }
    setPendingRole(role);
    setOtpTarget(`+91${phone}`);
    setReqId(result.reqId);
    setOtpInput('');
    setOtpError('');
    setResendMessage('');
    setPhase('otp');
  };

  const submitCandidate = () => {
    setCandidateTouched(true);
    if (!candidateValid || sendingRef.current) return;
    requestOtp('candidate', candidatePhone);
  };

  const parentValid =
    isValidName(parentName) &&
    /^\S+@\S+\.\S+$/.test(parentEmail) &&
    isValidIndianMobile(parentPhone) &&
    isValidName(childName);

  const submitParent = () => {
    setParentTouched(true);
    if (!parentValid || sendingRef.current) return;
    requestOtp('parent', parentPhone);
  };

  const handleResendOtp = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSendingOtp(true);
    setResendMessage('');
    setOtpError('');
    const result = await resendOtp(reqId, 'text');
    sendingRef.current = false;
    setSendingOtp(false);
    setResendMessage(result.ok ? 'Code resent.' : (result.error ?? 'Could not resend the code.'));
  };

  const handleVerifyOtp = async () => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setVerifying(true);
    setOtpError('');
    const result = await verifyOtp(reqId, otpInput.trim());
    verifyingRef.current = false;
    setVerifying(false);
    if (!result.ok) {
      setOtpError(result.error ?? 'Incorrect or expired code.');
      return;
    }
    if (pendingRole === 'candidate') {
      appState.registerCandidate({ name: candidateName.trim(), email: candidateEmail.trim(), phone: otpTarget });
      setWelcomeName(candidateName.trim());
      setPhase('welcome');
    } else if (pendingRole === 'parent') {
      const code = appState.registerParent({
        parentName: parentName.trim(),
        parentEmail: parentEmail.trim(),
        parentPhone: otpTarget,
        childName: childName.trim(),
      });
      setInviteCode(code);
      setPhase('invite-sent');
    }
  };

  const acceptInviteAndContinue = () => {
    appState.acceptInvite();
    setWelcomeName(childName.trim());
    setPhase('welcome');
  };

  return (
    <div className="flex max-w-lg flex-col gap-6.5 animate-rise-in">
      <div>
        <div className="text-xs font-semibold tracking-wide text-amber uppercase">Step 02</div>
        <h2 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">Register</h2>
        <p className="mt-2 text-sm text-muted">
          A quick account gets your eligibility report and prep progress saved. Candidates under 18 need a parent or
          guardian to register on their behalf.
        </p>
      </div>

      {phase === 'dob' && (
        <>
          <div>
            <label className={labelClass}>Candidate Date of Birth</label>
            <input
              type="date"
              value={dob}
              max={todayStr}
              onChange={(e) => setDob(e.target.value)}
              className={inputClass}
            />
            {dobTouched && !dobCheck.valid && <div className={errorClass}>{dobCheck.error}</div>}
            {dobCheck.valid && <div className="mt-1.5 text-[12px] text-muted">Age: {dobCheck.age} years</div>}
          </div>
          <button
            type="button"
            onClick={confirmDob}
            className="font-heading clip-button self-start cursor-pointer border-none bg-amber px-7.5 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
          >
            Continue →
          </button>
        </>
      )}

      {phase === 'candidate-form' && (
        <>
          <div className="bg-bg-panel-2 border border-border px-4 py-3 text-[13px] text-khaki">
            Age {age} — registering as the candidate.
          </div>
          <div>
            <label className={labelClass}>Full Name</label>
            <input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} className={inputClass} />
            {candidateTouched && !isValidName(candidateName) && (
              <div className={errorClass}>Enter your full name (letters only, at least 2 characters).</div>
            )}
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              className={inputClass}
            />
            {candidateTouched && !/^\S+@\S+\.\S+$/.test(candidateEmail) && (
              <div className={errorClass}>Enter a valid email address.</div>
            )}
          </div>
          <MobileField label="Phone" value={candidatePhone} onChange={setCandidatePhone} touched={candidateTouched} />
          {sendError && <div className={errorClass}>{sendError}</div>}
          <div className="flex gap-3.5">
            <button
              type="button"
              onClick={() => setPhase('dob')}
              className="font-heading cursor-pointer border border-border bg-transparent px-6.5 py-3.5 text-sm font-semibold tracking-wide text-muted uppercase"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={sendingOtp}
              onClick={submitCandidate}
              className="font-heading clip-button cursor-pointer border-none bg-amber px-7.5 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase disabled:opacity-50"
            >
              {sendingOtp ? 'Sending Code…' : 'Send OTP & Continue →'}
            </button>
          </div>
        </>
      )}

      {phase === 'parent-form' && (
        <>
          <div className="bg-bg-panel-2 border border-amber px-4 py-3 text-[13px] text-khaki">
            Age {age} is under 18 — a parent or guardian needs to register and invite the candidate.
          </div>
          <div>
            <label className={labelClass}>Parent / Guardian Name</label>
            <input value={parentName} onChange={(e) => setParentName(e.target.value)} className={inputClass} />
            {parentTouched && !isValidName(parentName) && (
              <div className={errorClass}>Enter the parent/guardian's full name.</div>
            )}
          </div>
          <div>
            <label className={labelClass}>Parent / Guardian Email</label>
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className={inputClass}
            />
            {parentTouched && !/^\S+@\S+\.\S+$/.test(parentEmail) && (
              <div className={errorClass}>Enter a valid email address.</div>
            )}
          </div>
          <MobileField label="Parent / Guardian Phone" value={parentPhone} onChange={setParentPhone} touched={parentTouched} />
          <div>
            <label className={labelClass}>Candidate (Child) Name</label>
            <input value={childName} onChange={(e) => setChildName(e.target.value)} className={inputClass} />
            {parentTouched && !isValidName(childName) && <div className={errorClass}>Enter the candidate's full name.</div>}
          </div>
          {sendError && <div className={errorClass}>{sendError}</div>}
          <div className="flex gap-3.5">
            <button
              type="button"
              onClick={() => setPhase('dob')}
              className="font-heading cursor-pointer border border-border bg-transparent px-6.5 py-3.5 text-sm font-semibold tracking-wide text-muted uppercase"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={sendingOtp}
              onClick={submitParent}
              className="font-heading clip-button cursor-pointer border-none bg-amber px-7.5 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase disabled:opacity-50"
            >
              {sendingOtp ? 'Sending Code…' : `Send OTP & Invite ${childName || 'Child'} →`}
            </button>
          </div>
        </>
      )}

      {phase === 'otp' && (
        <>
          <div>
            <div className="font-heading text-xl font-bold tracking-wide uppercase">Verify Your Number</div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              We've sent a 6-digit code via SMS to {otpTarget}. Enter it below to confirm your account.
            </p>
          </div>
          <div>
            <label className={labelClass}>Enter the 6-digit code</label>
            <input
              type="tel"
              inputMode="numeric"
              value={otpInput}
              onChange={(e) => setOtpInput(digitsOnly(e.target.value, 6))}
              className={inputClass}
            />
            {otpError && <div className={errorClass}>{otpError}</div>}
            {resendMessage && <div className="mt-1.5 text-[12px] text-muted">{resendMessage}</div>}
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={() => setPhase(pendingRole === 'parent' ? 'parent-form' : 'candidate-form')}
              className="font-heading cursor-pointer border border-border bg-transparent px-6.5 py-3.5 text-sm font-semibold tracking-wide text-muted uppercase"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={verifying || otpInput.length < 4}
              onClick={handleVerifyOtp}
              className="font-heading clip-button cursor-pointer border-none bg-amber px-7.5 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase disabled:opacity-50"
            >
              {verifying ? 'Verifying…' : 'Verify & Continue →'}
            </button>
            <button
              type="button"
              disabled={sendingOtp}
              onClick={handleResendOtp}
              className="text-[12px] tracking-wide text-amber uppercase disabled:opacity-50"
            >
              {sendingOtp ? 'Resending…' : 'Resend Code'}
            </button>
          </div>
        </>
      )}

      {phase === 'invite-sent' && (
        <>
          <div className="flex h-11 w-11 items-center justify-center bg-eligible">
            <span className="font-heading text-xl font-bold text-[#0f130a]">✓</span>
          </div>
          <div>
            <div className="font-heading text-xl font-bold tracking-wide uppercase">Invite Sent</div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {parentName} has registered on behalf of {childName}. An invite would normally be emailed to{' '}
              {childName} — no live email integration in this build, so here's the invite code directly.
            </p>
          </div>
          <div className="bg-bg-panel border border-amber flex items-center justify-between px-5 py-4">
            <div className="font-heading text-2xl font-bold tracking-[3px] text-khaki">{inviteCode}</div>
            <div className="text-[11px] text-muted">Invite Code</div>
          </div>
          <button
            type="button"
            onClick={acceptInviteAndContinue}
            className="font-heading clip-button self-start cursor-pointer border-none bg-amber px-7.5 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
          >
            Continue as {childName} (Accept Invite) →
          </button>
        </>
      )}

      {phase === 'welcome' && (
        <>
          <div className="flex h-11 w-11 items-center justify-center bg-eligible">
            <span className="font-heading text-xl font-bold text-[#0f130a]">✓</span>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide text-amber uppercase">Account Created</div>
            <div className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">
              Welcome, {welcomeName}!
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Your MissionFauj account is set up. Next, let's build your candidate profile — a few quick questions on
              education and status — so we can run your eligibility scan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onComplete(age)}
            className="font-heading clip-button self-start cursor-pointer border-none bg-amber px-7.5 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase"
          >
            Let's Build Your Profile →
          </button>
        </>
      )}
    </div>
  );
}
