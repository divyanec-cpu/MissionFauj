import { Router } from 'express';
import { renderAdminPage, escapeHtml } from '../../lib/adminLayout.js';

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

diagnosticsRouter.get('/', (_req, res) => {
  res.send(
    renderAdminPage({
      title: 'Diagnostics',
      activePath: '/admin/diagnostics',
      body: `
        <h1>Diagnostics</h1>
        <p class="muted">Connectivity checks that can only be answered from the deployed server.</p>

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
