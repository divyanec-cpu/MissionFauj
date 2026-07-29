import { Router } from 'express';
import { renderAdminPage, escapeHtml } from '../../lib/adminLayout.js';
import { isVerificationEnforced } from '../../lib/msg91.js';

export const diagnosticsRouter = Router();

const VERIFY_ACCESS_TOKEN_URL = 'https://control.msg91.com/api/v5/widget/verifyAccessToken';
const PROBE_TIMEOUT_MS = 12_000;

interface ProbeResult {
  reachable: boolean;
  verdict: string;
  detail: string;
  status?: number;
  bodySnippet?: string;
  elapsedMs: number;
}

/**
 * Answers one question: can this server reach MSG91's widget API at all?
 *
 * OTP send/verify were moved into the browser because Render's outbound IP was
 * getting intermittently blocked by MSG91's anti-abuse layer. That is also why
 * /auth/verify-otp cannot currently confirm the code with MSG91 and instead
 * trusts the client's report — which is fine while no user data sits behind it,
 * and not fine the moment any does.
 *
 * The probe deliberately sends a bogus authkey and token. A JSON rejection is
 * the *success* case: MSG91 answered us, so the network path is open and the
 * real fix (server-side verifyAccessToken) is available. A timeout, an HTML
 * error page, or a 403 from the anti-abuse layer means the block is still in
 * force and OTP has to be re-platformed instead.
 *
 * No real credential is sent, so this reveals nothing even if the response is
 * pasted around — but it is still behind the admin session, since an endpoint
 * that makes the server call out on request shouldn't be left open.
 */
async function probeMsg91(): Promise<ProbeResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const res = await fetch(VERIFY_ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authkey: 'probe-not-a-real-authkey', 'access-token': 'probe-not-a-real-token' }),
      signal: controller.signal,
    });
    const elapsedMs = Date.now() - startedAt;
    const text = await res.text().catch(() => '');
    const looksJson = text.trim().startsWith('{') || text.trim().startsWith('[');

    if (looksJson) {
      return {
        reachable: true,
        verdict: 'Reachable — MSG91 answered',
        detail:
          'MSG91 replied with JSON (rejecting our deliberately fake credentials, which is the expected and correct response). The network path from this server to MSG91 is open, so server-side verifyAccessToken is viable and OTP verification can be made server-authoritative.',
        status: res.status,
        bodySnippet: text.slice(0, 400),
        elapsedMs,
      };
    }

    return {
      reachable: false,
      verdict: 'Blocked — non-JSON response',
      detail:
        'Something answered, but not MSG91\'s API — an HTML error or challenge page is the signature of the anti-abuse layer intercepting this server\'s IP. Server-side verification is not viable from here as things stand.',
      status: res.status,
      bodySnippet: text.slice(0, 400),
      elapsedMs,
    };
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    const aborted = err instanceof Error && err.name === 'AbortError';
    return {
      reachable: false,
      verdict: aborted ? 'Blocked — request timed out' : 'Blocked — connection failed',
      detail: aborted
        ? `No response within ${PROBE_TIMEOUT_MS / 1000}s. A silent timeout (rather than a refusal) is what IP-level blocking usually looks like.`
        : 'The connection failed outright before any response came back.',
      bodySnippet: err instanceof Error ? err.message : String(err),
      elapsedMs,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Narrows down *why* the key isn't taking effect, without ever revealing a
 * value. Names only: a wrong name (MSG91_AUTHKEY, MSG91_AUTH_TOKEN, a stray
 * space) is by far the most common cause and is invisible from the dashboard,
 * where the variable looks perfectly correct at a glance.
 */
function renderEnvDiagnosis(): string {
  const names = Object.keys(process.env).filter((k) => /msg91/i.test(k)).sort();
  const raw = process.env.MSG91_AUTH_KEY;

  if (raw !== undefined && raw.trim() === '') {
    return `<p class="error">A variable named <code>MSG91_AUTH_KEY</code> exists but its value is empty or only
      whitespace, so it is treated as unset. Re-paste the key, checking for a stray space or newline.</p>`;
  }

  if (names.length === 0) {
    return `<p class="error">This process can see <strong>no environment variables at all</strong> whose name
      contains "MSG91". Either the variable was saved on a different service, or the service has not restarted since
      it was saved.</p>`;
  }

  return `<p class="error">This process can see these MSG91-related variable names, but not
    <code>MSG91_AUTH_KEY</code> exactly — compare them character by character against what is in the dashboard:</p>
    <ul>${names.map((n) => `<li><code>${escapeHtml(n)}</code></li>`).join('')}</ul>
    <p class="muted" style="font-size:0.85rem">Names only — values are never read or displayed here.</p>`;
}

interface AuthkeyResult {
  accepted: boolean | null;
  verdict: string;
  detail: string;
  bodySnippet?: string;
}

/**
 * Checks whether the *configured* authkey is one MSG91 actually accepts,
 * without needing a real SMS.
 *
 * It sends the real authkey with a deliberately bogus access-token, which
 * separates the two failure modes: MSG91 rejects a bad authkey with
 * AuthenticationFailure (code 201), whereas a good authkey gets past that and
 * fails on the token instead. So "rejected the token" is the success signal.
 *
 * This exists because the widget Token Auth and the account Authkey look alike
 * and are easy to confuse, and picking the wrong one is silently fatal:
 * enforcement turns on because a key is *present*, then every sign-in fails.
 * The authkey is sent to MSG91, which is its normal use, and is never logged
 * or rendered here.
 */
async function probeConfiguredAuthkey(): Promise<AuthkeyResult> {
  const authkey = process.env.MSG91_AUTH_KEY?.trim();
  if (!authkey) {
    return { accepted: null, verdict: 'No key configured', detail: 'Set MSG91_AUTH_KEY first, then re-run this.' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(VERIFY_ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authkey, 'access-token': 'probe-not-a-real-token' }),
      signal: controller.signal,
    });
    const text = await res.text().catch(() => '');
    const looksAuthFailure = /authenticationfailure/i.test(text) || /"code"\s*:\s*"?201"?/.test(text);

    if (looksAuthFailure) {
      return {
        accepted: false,
        verdict: 'Rejected — this is the wrong credential',
        detail:
          'MSG91 refused the configured key itself (AuthenticationFailure), not just the fake token. This is what happens when the widget Token Auth is used instead of the account Authkey. Enforcement is active with a key that cannot work, so real sign-ins will fail — remove or correct the variable now.',
        bodySnippet: text.slice(0, 300),
      };
    }

    return {
      accepted: true,
      verdict: 'Accepted — the key works',
      detail:
        'MSG91 got past authentication and rejected only the fake token, which is exactly the expected response. The configured authkey is valid, so real sign-ins can be verified against it.',
      bodySnippet: text.slice(0, 300),
    };
  } catch {
    return {
      accepted: null,
      verdict: 'Could not determine',
      detail: 'MSG91 could not be reached, so the key could not be checked. Run the reachability probe below.',
    };
  } finally {
    clearTimeout(timeout);
  }
}

diagnosticsRouter.post('/authkey', async (_req, res) => {
  const result = await probeConfiguredAuthkey();
  const tone = result.accepted === true ? '#7a8b4f' : result.accepted === false ? '#9c5b3c' : '#5c6670';

  res.send(
    renderAdminPage({
      title: 'MSG91 Authkey',
      activePath: '/admin/diagnostics',
      body: `
        <h1>Configured Authkey</h1>
        <div class="card" style="max-width:720px;border-left:4px solid ${tone}">
          <div style="font-size:1.15rem;font-weight:700;color:${tone}">${escapeHtml(result.verdict)}</div>
          <p>${escapeHtml(result.detail)}</p>
          ${
            result.bodySnippet
              ? `<h2 style="margin-top:1.5rem">Raw response</h2>
                 <pre style="white-space:pre-wrap;word-break:break-word;background:#22251a;border:1px solid #3a3d2e;padding:0.75rem;font-size:0.8rem;color:#c9bd97">${escapeHtml(
                   result.bodySnippet,
                 )}</pre>`
              : ''
          }
          <a class="btn secondary" href="/admin/diagnostics">Back</a>
        </div>
      `,
    }),
  );
});

diagnosticsRouter.get('/', (_req, res) => {
  const enforced = isVerificationEnforced();
  const tone = enforced ? '#7a8b4f' : '#9c5b3c';

  res.send(
    renderAdminPage({
      title: 'Diagnostics',
      activePath: '/admin/diagnostics',
      body: `
        <h1>Diagnostics</h1>
        <p class="muted">Connectivity checks that can only be answered from the deployed server.</p>

        <h2>OTP verification mode</h2>
        <div class="card" style="max-width:720px;border-left:4px solid ${tone}">
          <div style="font-size:1.15rem;font-weight:700;color:${tone}">
            ${enforced ? 'ENFORCED — codes are verified with MSG91' : 'NOT ENFORCED — the sign-in gate is forgeable'}
          </div>
          ${
            enforced
              ? `<p>Every sign-in re-checks MSG91's access token server-side and requires it to belong to the number
                 being claimed. A caller cannot obtain a token for a number they do not control.</p>
                 <p class="muted" style="font-size:0.85rem">A key being <em>present</em> is not proof it is the
                 <em>right</em> one — the widget Token Auth and the account Authkey are easy to confuse, and the wrong
                 one fails every sign-in. Confirm it before relying on this.</p>
                 <form method="post" action="/admin/diagnostics/authkey">
                   <button type="submit">Test Configured Authkey</button>
                 </form>`
              : `<p><strong>MSG91_AUTH_KEY is not visible to this server process.</strong> Sign-in currently accepts
                 the client's word that the code was verified, so anyone able to send two HTTP requests can obtain a
                 token for any phone number, without an SMS ever being sent. That permits forged consent records and
                 inflates the signup count on Stats.</p>
                 ${renderEnvDiagnosis()}
                 <p class="muted" style="font-size:0.85rem">Environment variables are injected when the process
                 starts, so saving one is not enough — the service has to redeploy or restart before it can see it.
                 No code change is needed; enforcement switches on by itself once the key is present.</p>`
          }
        </div>

        <h2>MSG91 reachability</h2>
        <div class="card" style="max-width:720px">
          <p style="margin-top:0">
            Checks whether this server can reach MSG91's widget API. This decides whether OTP verification
            can be made server-authoritative — today the backend trusts the client's word that the code was
            verified, which is safe only while no candidate data sits behind it.
          </p>
          <p class="muted" style="font-size:0.85rem">
            Sends a deliberately fake authkey. A JSON rejection means success: MSG91 answered us.
          </p>
          <form method="post" action="/admin/diagnostics/msg91">
            <button type="submit">Run Probe</button>
          </form>
        </div>
      `,
    }),
  );
});

diagnosticsRouter.post('/msg91', async (_req, res) => {
  const result = await probeMsg91();
  const tone = result.reachable ? '#7a8b4f' : '#9c5b3c';

  res.send(
    renderAdminPage({
      title: 'MSG91 Probe',
      activePath: '/admin/diagnostics',
      body: `
        <h1>MSG91 Reachability</h1>
        <div class="card" style="max-width:720px;border-left:4px solid ${tone}">
          <div style="font-size:1.15rem;font-weight:700;color:${tone}">${escapeHtml(result.verdict)}</div>
          <p>${escapeHtml(result.detail)}</p>
          <table>
            <tr><th>Reachable</th><td>${result.reachable ? 'yes' : 'no'}</td></tr>
            <tr><th>HTTP status</th><td>${result.status ?? '—'}</td></tr>
            <tr><th>Elapsed</th><td>${result.elapsedMs} ms</td></tr>
          </table>
          <h2 style="margin-top:1.5rem">Raw response</h2>
          <pre style="white-space:pre-wrap;word-break:break-word;background:#22251a;border:1px solid #3a3d2e;padding:0.75rem;font-size:0.8rem;color:#c9bd97">${escapeHtml(
            result.bodySnippet ?? '(empty)',
          )}</pre>
          <a class="btn secondary" href="/admin/diagnostics">Back</a>
        </div>
      `,
    }),
  );
});
