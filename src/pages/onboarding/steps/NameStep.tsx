import { useState } from 'react';
import { isValidName } from '../../../lib/validation';

interface NameStepProps {
  onSubmit: (name: string) => void;
}

export function NameStep({ onSubmit }: NameStepProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const trimmed = name.trim();
    if (!isValidName(trimmed)) {
      setError('Enter your name — letters only, at least 2 characters.');
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col items-center gap-5.5 pt-6 text-center sm:pt-14 animate-rise-in">
      <div className="text-xs font-semibold tracking-[3px] text-amber uppercase">Almost There</div>
      <h1 className="font-heading max-w-2xl text-4xl leading-tight font-bold tracking-wide uppercase sm:text-5xl">
        What Should We Call You?
      </h1>
      <p className="max-w-lg text-base leading-relaxed text-muted">
        Just your name — everything else about your account is already verified from sign-in.
      </p>
      <div className="w-full max-w-sm">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoFocus
          placeholder="Your name"
          className="bg-bg-panel-2 border border-border w-full px-4 py-3.5 text-center text-lg text-ink"
        />
        {error && <div className="mt-2 text-[13px] text-not-eligible">{error}</div>}
      </div>
      <button
        type="button"
        onClick={submit}
        className="font-heading clip-button mt-1.5 cursor-pointer border-none bg-amber px-8.5 py-4 text-[15px] font-bold tracking-wide text-[#1b1500] uppercase"
      >
        Continue →
      </button>
    </div>
  );
}
