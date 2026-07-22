import { useEffect, useRef, useState } from 'react';
import { Stepper } from '../../components/layout/Stepper';
import { acceptConsent, confirmAge, resendOtp, sendOtp, verifyOtp, CONSENT_VERSION } from '../../lib/authApi';
import { isValidIndianMobile, isValidName } from '../../lib/validation';
import type { VerifiedAuth } from '../../types/auth';

type Step =
  | 'welcome'
  | 'phone'
  | 'otp'
  | 'dob'
  | 'adultConsent'
  | 'guardianPhone'
  | 'guardianOtp'
  | 'guardianConsent'
  | 'done';

const RESEND_SECONDS = 30;

const inputClass = 'bg-bg-panel-2 border border-border w-full px-3.5 py-3 text-sm text-ink';
const labelClass = 'mb-1.5 block text-[11px] tracking-wide text-muted uppercase';
const errorClass = 'mt-1.5 text-[12px] text-not-eligible';
const primaryButtonClass =
  'font-heading clip-button self-start cursor-pointer border-none bg-amber px-7.5 py-3.5 text-sm font-bold tracking-wide text-[#1b1500] uppercase disabled:cursor-not-allowed disabled:opacity-60';

function digitsOnly(value: string, maxLen: number) {
  return value.replace(/\D/g, '').slice(0, maxLen);
}

function maskPhone(phone: string) {
  return phone ? 'XXXXX' + phone.slice(-4) : '';
}

function PhoneField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="border-border bg-bg-panel-2 flex border">
        <div className="border-border text-khaki font-heading border-r px-4 py-3.5 text-base font-bold">+91</div>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(digitsOnly(e.target.value, 10))}
          placeholder="10-digit mobile number"
          className="font-heading w-full bg-transparent px-4 py-3.5 text-lg font-semibold tracking-wider text-ink outline-none"
        />
      </div>
      {error && <div className={errorClass}>{error}</div>}
    </div>
  );
}

const CONSENT_SECTIONS = [
  {
    title: 'What we collect',
    body: 'Your profile (name, age, target exam), exam progress, and — only if you use it — your AI Assistant chat history.',
  },
  {
    title: 'How AI is used',
    body: 'The AI Assistant answers your questions. SSB psychology and interview responses (WAT, TAT, PPDT, interviews) are never auto-scored by AI — only trained assessors evaluate those.',
  },
  {
    title: 'Data retention & deletion',
    body: 'We keep your data as long as your account is active. Delete everything, anytime, from Help Center → Data & Privacy — deletion is permanent.',
  },
  {
    title: 'Your rights',
    body: 'Under the DPDP Act, you can access, correct, or delete your data, and withdraw consent at any time without losing access to free features.',
  },
];

function guardianConsentSections(guardianName: string) {
  return [
    {
      title: "Who's asking",
      body: `${guardianName || 'You'} are confirming you are the parent or guardian of this account holder, who is under 18.`,
    },
    {
      title: 'What your child logs',
      body: 'Exam prep progress, SSB training module activity, and — if used — AI Assistant chat history.',
    },
    {
      title: 'What stays private to them',
      body: 'SSB psychology and interview responses, and their AI chat history, are never shared with you or anyone else — your consent authorizes MissionFauj to process this data, it does not grant you visibility into it.',
    },
    {
      title: 'How AI is used',
      body: 'The AI Assistant answers exam questions in trial (3 questions) or unlimited (paid) mode. It never auto-scores SSB psychology or interview material.',
    },
    {
      title: 'Your rights as guardian',
      body: "You can withdraw this consent at any time, which pauses the account, from Help Center → Data & Privacy. You may also request deletion of your child's data at any time.",
    },
  ];
}

const FAQ_GROUPS = [
  {
    topic: 'Login & OTP',
    items: [
      {
        q: 'Why do you need my mobile number?',
        a: "It's your login — no email or password to remember, and it's how we verify you're a real person for a defence-exam prep account.",
      },
      {
        q: "I didn't receive the OTP.",
        a: 'Wait for the resend timer to finish, then tap Resend. Check that your number is entered correctly and has SMS signal.',
      },
      {
        q: 'Can I change my mobile number later?',
        a: 'Yes — use "Change number" during verification, or update it from Help Center once you\'re signed in.',
      },
    ],
  },
  {
    topic: 'Guardian Consent',
    items: [
      {
        q: 'Why does my parent need to be involved?',
        a: "India's DPDP Act requires verified consent from a parent or guardian for any user under 18. NDA aspirants can be as young as 16.5, so this step is built in.",
      },
      {
        q: 'What does my guardian see about me?',
        a: 'Nothing beyond consenting. Your practice progress, SSB psychology responses, and AI chat history stay private to your account.',
      },
      {
        q: 'What information do you collect from my guardian?',
        a: 'Only their name and mobile number, used once to verify consent. We store nothing else about them.',
      },
    ],
  },
  {
    topic: 'Your Data & Privacy',
    items: [
      {
        q: 'What data does MissionFauj collect?',
        a: 'Your profile basics, exam progress, and — if you use it — the AI Assistant chat history. SSB psychology and interview responses are never auto-scored.',
      },
      {
        q: 'Is my data shared with anyone?',
        a: "No. It's used only to run your prep experience — never sold or shared with third parties.",
      },
      {
        q: 'Can I delete my data?',
        a: 'Yes, at any time from Help Center → Data & Privacy. Deletion is permanent.',
      },
    ],
  },
];

interface LoginSequenceProps {
  onDone: (auth: VerifiedAuth) => void;
}

export function LoginSequencePage({ onDone }: LoginSequenceProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [helpOpen, setHelpOpen] = useState(false);

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  const [candidateToken, setCandidateToken] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpShake, setOtpShake] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const resendInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const verifyingRef = useRef(false);
  const sendingRef = useRef(false);

  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [dobError, setDobError] = useState('');
  const [confirmingAge, setConfirmingAge] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [isMinor, setIsMinor] = useState(false);
  const [ageToken, setAgeToken] = useState('');

  const [consenting, setConsenting] = useState(false);
  const [consentError, setConsentError] = useState('');
  const pendingAuthRef = useRef<Parameters<LoginSequenceProps['onDone']>[0] | null>(null);

  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianPhoneError, setGuardianPhoneError] = useState('');
  const [guardianToken, setGuardianToken] = useState('');
  const [guardianOtp, setGuardianOtp] = useState('');
  const [guardianOtpError, setGuardianOtpError] = useState('');
  const [guardianOtpShake, setGuardianOtpShake] = useState(false);
  const [guardianSendingOtp, setGuardianSendingOtp] = useState(false);
  const [guardianVerifyingOtp, setGuardianVerifyingOtp] = useState(false);
  const [guardianResendTimer, setGuardianResendTimer] = useState(RESEND_SECONDS);
  const guardianResendInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const guardianVerifyingRef = useRef(false);
  const guardianSendingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (resendInterval.current) clearInterval(resendInterval.current);
      if (guardianResendInterval.current) clearInterval(guardianResendInterval.current);
    };
  }, []);

  function startResendTimer(intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>, setTimer: (n: number | ((prev: number) => number)) => void) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimer(RESEND_SECONDS);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        const next = prev - 1;
        if (next <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return Math.max(next, 0);
      });
    }, 1000);
  }

  const showBack = step !== 'welcome' && step !== 'done';

  const goBack = () => {
    if (step === 'adultConsent' || step === 'guardianPhone') {
      setStep('dob');
      return;
    }
    if (step === 'guardianOtp') {
      setStep('guardianPhone');
      return;
    }
    if (step === 'guardianConsent') {
      setStep('guardianOtp');
      return;
    }
    const order: Step[] = ['welcome', 'phone', 'otp', 'dob'];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  };

  const flowSteps: Step[] = isMinor
    ? ['welcome', 'phone', 'otp', 'dob', 'guardianPhone', 'guardianOtp', 'guardianConsent', 'done']
    : ['welcome', 'phone', 'otp', 'dob', 'adultConsent', 'done'];
  const stepLabels: Record<Step, string> = {
    welcome: 'Start',
    phone: 'Mobile',
    otp: 'Verify',
    dob: 'Age Check',
    adultConsent: 'Consent',
    guardianPhone: 'Guardian',
    guardianOtp: 'Verify',
    guardianConsent: 'Consent',
    done: 'Done',
  };
  const activeIdx = Math.max(0, flowSteps.indexOf(step));

  const handleSendOtp = async () => {
    if (sendingRef.current) return;
    if (!isValidIndianMobile(phone)) {
      setPhoneError('Enter a valid 10-digit Indian mobile number (starts 6-9).');
      return;
    }
    sendingRef.current = true;
    setSendingOtp(true);
    setPhoneError('');
    try {
      await sendOtp(phone, 'candidate');
      setOtp('');
      setOtpError('');
      setStep('otp');
      startResendTimer(resendInterval, setResendTimer);
    } catch (err) {
      setPhoneError(err instanceof Error ? err.message : 'Could not send the code. Please try again.');
    } finally {
      sendingRef.current = false;
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || sendingRef.current) return;
    sendingRef.current = true;
    setSendingOtp(true);
    try {
      await resendOtp(phone);
      startResendTimer(resendInterval, setResendTimer);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Could not resend the code. Please try again.');
    } finally {
      sendingRef.current = false;
      setSendingOtp(false);
    }
  };

  const changeNumber = () => {
    if (resendInterval.current) clearInterval(resendInterval.current);
    setOtp('');
    setOtpError('');
    setStep('phone');
  };

  const handleVerifyOtp = async () => {
    if (verifyingRef.current) return;
    if (otp.length !== 6) {
      setOtpError('Enter the full 6-digit code.');
      return;
    }
    verifyingRef.current = true;
    setVerifyingOtp(true);
    try {
      const { token } = await verifyOtp(phone, otp, 'candidate');
      if (resendInterval.current) clearInterval(resendInterval.current);
      setCandidateToken(token);
      setStep('dob');
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Incorrect code. Please try again.');
      setOtpShake(true);
      setTimeout(() => setOtpShake(false), 400);
    } finally {
      verifyingRef.current = false;
      setVerifyingOtp(false);
    }
  };

  const handleConfirmAge = async () => {
    if (!dobDay || !dobMonth || !dobYear) {
      setDobError('Enter your full date of birth.');
      return;
    }
    setConfirmingAge(true);
    setDobError('');
    try {
      const result = await confirmAge(candidateToken, Number(dobDay), Number(dobMonth), Number(dobYear));
      setAge(result.age);
      setIsMinor(result.isMinor);
      setAgeToken(result.token);
      setStep(result.isMinor ? 'guardianPhone' : 'adultConsent');
    } catch (err) {
      setDobError(err instanceof Error ? err.message : 'Could not verify that date. Please try again.');
    } finally {
      setConfirmingAge(false);
    }
  };

  const acceptAdultConsent = async () => {
    if (consenting) return;
    setConsenting(true);
    setConsentError('');
    try {
      await acceptConsent({ ageToken, consentVersion: CONSENT_VERSION });
      pendingAuthRef.current = {
        candidatePhone: phone,
        age: age ?? 0,
        isMinor: false,
        consentAcceptedAt: new Date().toISOString(),
      };
      setStep('done');
    } catch (err) {
      setConsentError(err instanceof Error ? err.message : 'Could not record consent. Please try again.');
    } finally {
      setConsenting(false);
    }
  };

  const handleSendGuardianOtp = async () => {
    if (guardianSendingRef.current) return;
    if (!isValidName(guardianName)) {
      setGuardianPhoneError("Enter the guardian's full name (letters only, at least 2 characters).");
      return;
    }
    if (!isValidIndianMobile(guardianPhone)) {
      setGuardianPhoneError('Enter a valid 10-digit Indian mobile number (starts 6-9).');
      return;
    }
    guardianSendingRef.current = true;
    setGuardianSendingOtp(true);
    setGuardianPhoneError('');
    try {
      await sendOtp(guardianPhone, 'guardian');
      setGuardianOtp('');
      setGuardianOtpError('');
      setStep('guardianOtp');
      startResendTimer(guardianResendInterval, setGuardianResendTimer);
    } catch (err) {
      setGuardianPhoneError(err instanceof Error ? err.message : 'Could not send the code. Please try again.');
    } finally {
      guardianSendingRef.current = false;
      setGuardianSendingOtp(false);
    }
  };

  const handleResendGuardianOtp = async () => {
    if (guardianResendTimer > 0 || guardianSendingRef.current) return;
    guardianSendingRef.current = true;
    setGuardianSendingOtp(true);
    try {
      await resendOtp(guardianPhone);
      startResendTimer(guardianResendInterval, setGuardianResendTimer);
    } catch (err) {
      setGuardianOtpError(err instanceof Error ? err.message : 'Could not resend the code. Please try again.');
    } finally {
      guardianSendingRef.current = false;
      setGuardianSendingOtp(false);
    }
  };

  const handleVerifyGuardianOtp = async () => {
    if (guardianVerifyingRef.current) return;
    if (guardianOtp.length !== 6) {
      setGuardianOtpError('Enter the full 6-digit code.');
      return;
    }
    guardianVerifyingRef.current = true;
    setGuardianVerifyingOtp(true);
    try {
      const { token } = await verifyOtp(guardianPhone, guardianOtp, 'guardian');
      if (guardianResendInterval.current) clearInterval(guardianResendInterval.current);
      setGuardianToken(token);
      setStep('guardianConsent');
    } catch (err) {
      setGuardianOtpError(err instanceof Error ? err.message : 'Incorrect code. Please try again.');
      setGuardianOtpShake(true);
      setTimeout(() => setGuardianOtpShake(false), 400);
    } finally {
      guardianVerifyingRef.current = false;
      setGuardianVerifyingOtp(false);
    }
  };

  const acceptGuardianConsent = async () => {
    if (consenting) return;
    setConsenting(true);
    setConsentError('');
    try {
      await acceptConsent({
        ageToken,
        guardianToken,
        guardianName: guardianName.trim(),
        consentVersion: CONSENT_VERSION,
      });
      pendingAuthRef.current = {
        candidatePhone: phone,
        age: age ?? 0,
        isMinor: true,
        guardianName: guardianName.trim(),
        guardianPhone,
        consentAcceptedAt: new Date().toISOString(),
      };
      setStep('done');
    } catch (err) {
      setConsentError(err instanceof Error ? err.message : 'Could not record consent. Please try again.');
    } finally {
      setConsenting(false);
    }
  };

  const ageNote =
    age === null
      ? ''
      : isMinor
        ? "You're under 18 — next we'll verify your parent or guardian and get their consent, as required by the DPDP Act."
        : "You're 18 or older — you can consent for yourself on the next screen.";

  const doneNote = isMinor
    ? `${guardianName || 'Your guardian'} has consented on your behalf. You're ready to begin the eligibility briefing.`
    : "You're verified and ready to begin the eligibility briefing.";

  return (
    <div className="texture-hatch flex min-h-screen flex-col">
      <header className="border-border flex flex-wrap items-center justify-between gap-4 border-b px-5 py-5.5 sm:px-8 lg:px-14">
        <div className="flex items-center gap-3.5">
          {showBack && (
            <button
              type="button"
              onClick={goBack}
              className="border-border text-muted font-heading cursor-pointer border bg-transparent px-3.5 py-2 text-xs font-semibold tracking-wide uppercase"
            >
              ← Back
            </button>
          )}
          <div className="font-heading text-xl font-bold tracking-wider text-ink">
            MISSION<span className="text-amber">FAUJ</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Stepper steps={flowSteps.map((s) => stepLabels[s])} activeIndex={activeIdx} />
          <button
            type="button"
            onClick={() => setHelpOpen((v) => !v)}
            aria-label="Help"
            className="border-border bg-bg-panel text-khaki font-heading h-8.5 w-8.5 cursor-pointer rounded-full border text-[15px] font-bold"
          >
            ?
          </button>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-5 pt-6 pb-16 sm:px-8 sm:pt-10 lg:px-14">
        <div className="w-full max-w-[560px]">
          {step === 'welcome' && (
            <div className="animate-rise-in flex flex-col items-center gap-5.5 pt-10 text-center sm:pt-20">
              <div className="text-amber text-xs font-semibold tracking-[3px] uppercase">Secure Sign-In</div>
              <h1 className="font-heading text-[32px] leading-[1.05] font-bold tracking-wide uppercase sm:text-[50px]">
                Report For Duty
              </h1>
              <p className="text-muted max-w-[440px] text-[15px] leading-relaxed">
                One mobile number, one OTP. If you're under 18, we'll bring your parent or guardian in for a quick
                consent step — required under India's data protection law (DPDP Act).
              </p>
              <button type="button" onClick={() => setStep('phone')} className={`mt-2.5 ${primaryButtonClass}`}>
                Continue with Mobile Number →
              </button>
            </div>
          )}

          {step === 'phone' && (
            <div className="animate-rise-in flex flex-col gap-6 pt-2.5 sm:pt-10">
              <div>
                <div className="text-amber text-xs font-semibold tracking-wide uppercase">Step 01</div>
                <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">
                  Your Mobile Number
                </h2>
                <p className="text-muted mt-2 text-[13px]">We'll send a 6-digit one-time code by SMS.</p>
              </div>
              <PhoneField label="Phone" value={phone} onChange={setPhone} error={phoneError} />
              <div className="text-muted text-[11px] leading-relaxed">
                By continuing you agree to receive an SMS OTP. See our{' '}
                <button type="button" onClick={() => setHelpOpen(true)} className="text-amber underline">
                  privacy basics
                </button>{' '}
                in Help.
              </div>
              <button type="button" onClick={handleSendOtp} disabled={sendingOtp} className={primaryButtonClass}>
                {sendingOtp ? 'Sending…' : 'Send OTP →'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="animate-rise-in flex flex-col gap-6 pt-2.5 sm:pt-10">
              <div>
                <div className="text-amber text-xs font-semibold tracking-wide uppercase">Step 02</div>
                <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">
                  Enter The Code
                </h2>
                <p className="text-muted mt-2 text-[13px]">Sent by SMS to +91 {maskPhone(phone)}.</p>
              </div>
              <div className={otpShake ? 'animate-shake-x' : ''}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(digitsOnly(e.target.value, 6));
                    setOtpError('');
                  }}
                  placeholder="6-digit code"
                  className={`bg-bg-panel-2 font-heading w-full border px-4 py-4 text-center text-[26px] font-bold tracking-[10px] text-ink outline-none ${otpError ? 'border-not-eligible' : 'border-border'}`}
                />
                {otpError && <div className={errorClass}>{otpError}</div>}
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || sendingOtp}
                  className={`font-heading cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold disabled:cursor-not-allowed ${resendTimer > 0 ? 'text-muted' : 'text-amber'}`}
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                </button>
                <button
                  type="button"
                  onClick={changeNumber}
                  className="text-muted font-heading cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold"
                >
                  Change number
                </button>
              </div>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
                className={primaryButtonClass}
              >
                {verifyingOtp ? 'Verifying…' : 'Verify →'}
              </button>
            </div>
          )}

          {step === 'dob' && (
            <div className="animate-rise-in flex flex-col gap-6 pt-2.5 sm:pt-10">
              <div>
                <div className="text-amber text-xs font-semibold tracking-wide uppercase">Step 03</div>
                <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">
                  Confirm Your Age
                </h2>
                <p className="text-muted mt-2 text-[13px] leading-relaxed">
                  India's DPDP Act requires verified parental consent for anyone under 18. NDA aspirants can be as
                  young as 16.5, so we verify your real date of birth before anything else — not a self-declared age.
                </p>
              </div>
              <div>
                <div className="text-muted mb-2.5 text-[11px] tracking-wide uppercase">Date of Birth</div>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={dobDay}
                    onChange={(e) => {
                      setDobDay(digitsOnly(e.target.value, 2));
                      setDobError('');
                    }}
                    placeholder="DD"
                    className={`bg-bg-panel-2 font-heading w-[70px] border px-2.5 py-3.5 text-center text-lg font-bold text-ink outline-none ${dobError ? 'border-not-eligible' : 'border-border'}`}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={dobMonth}
                    onChange={(e) => {
                      setDobMonth(digitsOnly(e.target.value, 2));
                      setDobError('');
                    }}
                    placeholder="MM"
                    className={`bg-bg-panel-2 font-heading w-[70px] border px-2.5 py-3.5 text-center text-lg font-bold text-ink outline-none ${dobError ? 'border-not-eligible' : 'border-border'}`}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={dobYear}
                    onChange={(e) => {
                      setDobYear(digitsOnly(e.target.value, 4));
                      setDobError('');
                    }}
                    placeholder="YYYY"
                    className={`bg-bg-panel-2 font-heading w-[100px] border px-2.5 py-3.5 text-center text-lg font-bold text-ink outline-none ${dobError ? 'border-not-eligible' : 'border-border'}`}
                  />
                </div>
                {dobError && <div className={errorClass}>{dobError}</div>}
              </div>
              {ageNote && (
                <div className="border-border bg-bg-panel text-khaki border px-3.5 py-3 text-[12px] leading-relaxed">
                  {ageNote}
                </div>
              )}
              <button
                type="button"
                onClick={handleConfirmAge}
                disabled={confirmingAge}
                className={primaryButtonClass}
              >
                {confirmingAge ? 'Verifying…' : 'Verify & Continue →'}
              </button>
            </div>
          )}

          {step === 'adultConsent' && (
            <div className="animate-rise-in flex flex-col gap-5.5 pt-2.5 sm:pt-7.5">
              <div>
                <div className="text-amber text-xs font-semibold tracking-wide uppercase">Step 04</div>
                <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">
                  Your Data, Plainly Stated
                </h2>
              </div>
              {CONSENT_SECTIONS.map((sec) => (
                <div key={sec.title} className="border-amber border-l-3 pl-4">
                  <div className="font-heading mb-1.5 text-sm font-bold tracking-wide uppercase">{sec.title}</div>
                  <div className="text-muted text-[13px] leading-relaxed">{sec.body}</div>
                </div>
              ))}
              {consentError && <div className={errorClass}>{consentError}</div>}
              <button
                type="button"
                onClick={acceptAdultConsent}
                disabled={consenting}
                className={primaryButtonClass}
              >
                {consenting ? 'Recording…' : 'I Have Read This — I Consent →'}
              </button>
            </div>
          )}

          {step === 'guardianPhone' && (
            <div className="animate-rise-in flex flex-col gap-6 pt-2.5 sm:pt-7.5">
              <div>
                <div className="text-amber text-xs font-semibold tracking-wide uppercase">Step 04</div>
                <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">
                  Parent / Guardian Details
                </h2>
                <p className="text-muted mt-2 text-[13px] leading-relaxed">
                  Since you're under 18, a parent or guardian must verify and consent. We only ever collect their
                  name and mobile number — nothing else about them is stored.
                </p>
              </div>
              <div>
                <label className={labelClass}>Guardian's Name</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>
              <PhoneField
                label="Guardian's Mobile Number"
                value={guardianPhone}
                onChange={setGuardianPhone}
                error={guardianPhoneError}
              />
              <button
                type="button"
                onClick={handleSendGuardianOtp}
                disabled={guardianSendingOtp}
                className={primaryButtonClass}
              >
                {guardianSendingOtp ? 'Sending…' : 'Send OTP to Guardian →'}
              </button>
            </div>
          )}

          {step === 'guardianOtp' && (
            <div className="animate-rise-in flex flex-col gap-6 pt-2.5 sm:pt-7.5">
              <div>
                <div className="text-amber text-xs font-semibold tracking-wide uppercase">Step 05</div>
                <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">
                  Verify Guardian
                </h2>
                <p className="text-muted mt-2 text-[13px]">
                  Code sent by SMS to {guardianName} at +91 {maskPhone(guardianPhone)}.
                </p>
              </div>
              <div className={guardianOtpShake ? 'animate-shake-x' : ''}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={guardianOtp}
                  onChange={(e) => {
                    setGuardianOtp(digitsOnly(e.target.value, 6));
                    setGuardianOtpError('');
                  }}
                  placeholder="6-digit code"
                  className={`bg-bg-panel-2 font-heading w-full border px-4 py-4 text-center text-[26px] font-bold tracking-[10px] text-ink outline-none ${guardianOtpError ? 'border-not-eligible' : 'border-border'}`}
                />
                {guardianOtpError && <div className={errorClass}>{guardianOtpError}</div>}
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendGuardianOtp}
                  disabled={guardianResendTimer > 0 || guardianSendingOtp}
                  className={`font-heading cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold disabled:cursor-not-allowed ${guardianResendTimer > 0 ? 'text-muted' : 'text-amber'}`}
                >
                  {guardianResendTimer > 0 ? `Resend code in ${guardianResendTimer}s` : 'Resend code'}
                </button>
              </div>
              <button
                type="button"
                onClick={handleVerifyGuardianOtp}
                disabled={guardianVerifyingOtp}
                className={primaryButtonClass}
              >
                {guardianVerifyingOtp ? 'Verifying…' : 'Verify →'}
              </button>
            </div>
          )}

          {step === 'guardianConsent' && (
            <div className="animate-rise-in flex flex-col gap-5.5 pt-2.5 sm:pt-7.5">
              <div>
                <div className="text-amber text-xs font-semibold tracking-wide uppercase">
                  Step 06 · For {guardianName}
                </div>
                <h2 className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-3xl">
                  Guardian Consent
                </h2>
                <p className="text-muted mt-2 text-[13px] leading-relaxed">
                  Required under the DPDP Act before we can process your child's data. Plain language, no legal wall
                  of text.
                </p>
              </div>
              {guardianConsentSections(guardianName).map((sec) => (
                <div key={sec.title} className="border-amber border-l-3 pl-4">
                  <div className="font-heading mb-1.5 text-sm font-bold tracking-wide uppercase">{sec.title}</div>
                  <div className="text-muted text-[13px] leading-relaxed">{sec.body}</div>
                </div>
              ))}
              {consentError && <div className={errorClass}>{consentError}</div>}
              <button
                type="button"
                onClick={acceptGuardianConsent}
                disabled={consenting}
                className={primaryButtonClass}
              >
                {consenting ? 'Recording…' : 'I Am the Guardian — I Consent →'}
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="animate-rise-in flex flex-col items-center gap-5.5 pt-10 text-center sm:pt-20">
              <div className="text-eligible text-xs font-semibold tracking-[3px] uppercase">
                Verified &amp; Consented
              </div>
              <h1 className="font-heading text-[28px] leading-[1.1] font-bold tracking-wide uppercase sm:text-[44px]">
                Welcome Aboard, Cadet
              </h1>
              <p className="text-muted max-w-[440px] text-sm leading-relaxed">{doneNote}</p>
              <button
                type="button"
                onClick={() => pendingAuthRef.current && onDone(pendingAuthRef.current)}
                className={`mt-2.5 ${primaryButtonClass}`}
              >
                Continue to Eligibility Briefing →
              </button>
            </div>
          )}
        </div>
      </main>

      {helpOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/55" onClick={() => setHelpOpen(false)} />
          <div className="animate-slide-in bg-bg-panel border-border fixed top-0 right-0 z-41 h-full w-[min(420px,92vw)] overflow-y-auto border-l p-6.5">
            <div className="mb-4.5 flex items-center justify-between">
              <div className="font-heading text-xl font-bold tracking-wide uppercase">Help &amp; FAQs</div>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="border-border text-muted h-7.5 w-7.5 cursor-pointer border bg-transparent"
              >
                ✕
              </button>
            </div>
            {FAQ_GROUPS.map((grp) => (
              <div key={grp.topic} className="mb-6">
                <div className="text-amber mb-2.5 text-[11px] font-semibold tracking-wide uppercase">
                  {grp.topic}
                </div>
                {grp.items.map((qa) => (
                  <div key={qa.q} className="border-border border-b py-3">
                    <div className="font-heading mb-1.5 text-sm font-semibold">{qa.q}</div>
                    <div className="text-muted text-[13px] leading-relaxed">{qa.a}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
